// controllers/productController.js
import Products from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import logger from "../middleware/logger.js"; // ✅ import logger

// getAllProducts
export const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { category, minPrice, maxPrice, search, sortBy, order } = req.query;
    const filter = {};

    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = order === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const totalProducts = await Products.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await Products.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    logger.info(
      `Products fetched successfully | total: ${products.length}, page: ${page}`
    );

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    logger.error(`Error fetching products: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// getProductById
export const getProductById = async (req, res, next) => {
  try {
    const productId = await Products.findById(req.params.id);
    if (!productId) {
      logger.warn(`Product not found | id: ${req.params.id}`);
      return res.status(404).json({ message: "Product not found" });
    }

    logger.info(`Product fetched | id: ${req.params.id}`);
    res.status(200).json(productId);
  } catch (err) {
    logger.error(`Error fetching product by ID: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// createProduct - admin only
export const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, category, stock } = req.body;

    if (price < 0) {
      logger.warn(`Attempt to create product with negative price: ${price}`);
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    if (stock < 0) {
      logger.warn(`Attempt to create product with negative stock: ${stock}`);
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    const productExist = await Products.findOne({ name });
    if (productExist) {
      logger.warn(`Duplicate product creation attempt: ${name}`);
      return res.status(400).json({ message: "Product already exists" });
    }

    let imageUrl = null;
    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: "ecommerce-products",
      });
      imageUrl = uploadRes.secure_url;
      logger.info(`Image uploaded to Cloudinary: ${imageUrl}`);
    }

    const newProduct = await Products.create({
      name,
      price,
      description,
      category,
      stock,
      images: imageUrl || "default.jpg",
    });

    logger.info(`Product created successfully | name: ${name}`);
    res.status(201).json(newProduct);
  } catch (err) {
    logger.error(`Error creating product: ${err.message}`);
    res.status(400).json({ message: err.message });
  }
};

// updateProduct - admin only
export const updateProduct = async (req, res, next) => {
  try {
    const productId = await Products.findByIdAndUpdate(req.params.id);
    if (!productId) {
      logger.warn(`Update failed, product not found | id: ${req.params.id}`);
      const err = new Error("Product not found");
      throw err;
    }

    const { name, price, description, category, stock, images } = req.body;
    productId.name = name || productId.name;
    productId.price = price || productId.price;
    productId.description = description || productId.description;
    productId.category = category || productId.category;
    productId.stock = stock || productId.stock;
    productId.images = images || productId.images;

    await productId.save();
    logger.info(`Product updated successfully | id: ${req.params.id}`);
    res.status(200).json(productId);
  } catch (err) {
    logger.error(`Error updating product: ${err.message}`);
    res.status(404).json({ message: err.message });
  }
};

// deleteProduct - admin only
export const deleteProduct = async (req, res, next) => {
  try {
    const productId = await Products.findByIdAndDelete(req.params.id);
    if (!productId) {
      logger.warn(`Delete failed, product not found | id: ${req.params.id}`);
      const err = new Error("Product not found");
      throw err;
    }

    logger.info(`Product deleted successfully | id: ${req.params.id}`);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    logger.error(`Error deleting product: ${err.message}`);
    res.status(404).json({ message: err.message });
  }
};
