import Cart from "../models/Cart.js";
import logger from "../middleware/logger.js";

// add to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    logger.debug("Add to cart attempt", { userId, productId, quantity });

    let cart = await Cart.findOne({ user: userId });

    // cek apakah user sudah mempunyai cart
    if (!cart) {
      logger.debug("User has no cart, creating new cart", { userId });

      cart = await new Cart({
        user: userId,
        products: [{ product: productId, quantity }],
      });
      console.log(cart._id);
      await cart.populate("products.product", "name price");
      await cart.save();

      logger.info("New cart created and product added", {
        userId,
        productId,
        quantity,
        cartId: cart._id,
      });

      return res.status(201).json(cart);
    } else {
      logger.debug("User has existing cart, checking product", {
        userId,
        cartId: cart._id,
        productCount: cart.products.length,
      });

      //   cek apakah user sudah mempunyai product di cart
      const itemIndex = await cart.products.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // product sudah ada di cart maka update quantity
        const oldQuantity = cart.products[itemIndex].quantity;
        cart.products[itemIndex].quantity += quantity;

        logger.debug("Product exists in cart, quantity updated", {
          userId,
          productId,
          oldQuantity,
          newQuantity: cart.products[itemIndex].quantity,
        });
      } else {
        //  product belum ada di cart maka tambahkan product baru
        cart.products.push({ product: productId, quantity });

        logger.debug("New product added to existing cart", {
          userId,
          productId,
          quantity,
        });
      }
      await cart.populate("products.product", "name price");
      await cart.save();

      logger.info("Cart updated successfully", {
        userId,
        productId,
        totalProducts: cart.products.length,
      });

      return res.status(200).json(cart);
    }
  } catch (error) {
    logger.error("Failed to add product to cart", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
      productId: req.body?.productId,
    });

    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    logger.debug("Fetching cart", { userId });

    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product",
      "name price"
    );

    if (!cart) {
      logger.warn("Cart not found", { userId });
      const error = new Error("Cart not found");
      throw error;
    }

    logger.info("Cart retrieved successfully", {
      userId,
      productCount: cart.products.length,
    });

    return res.status(200).json(cart);
  } catch (error) {
    logger.error("Failed to fetch cart", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
    });

    res.status(404).json({ message: error.message });
  }
};

// updateCart
export const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    logger.debug("Update cart attempt", { userId, productId, quantity });

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      logger.warn("Cannot update cart - Cart not found", { userId });
      return res.status(404).json({ message: "Cart not found" });
    }

    logger.debug("Cart found, updating product", {
      userId,
      cartId: cart._id,
      currentProductCount: cart.products.length,
    });

    const itemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // product already exists in cart, update quantity
      const oldQuantity = cart.products[itemIndex].quantity;
      cart.products[itemIndex].quantity += quantity;

      logger.debug("Product quantity updated in cart", {
        userId,
        productId,
        oldQuantity,
        addedQuantity: quantity,
        newQuantity: cart.products[itemIndex].quantity,
      });
    } else {
      // product doesn't exist in cart, add new product
      cart.products.push({ product: productId, quantity });

      logger.debug("New product added to cart via update", {
        userId,
        productId,
        quantity,
      });
    }

    await cart.save();

    logger.info("Cart updated successfully", {
      userId,
      productId,
      totalProducts: cart.products.length,
    });

    return res.status(200).json(cart);
  } catch (error) {
    logger.error("Failed to update cart", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
      productId: req.body?.productId,
    });

    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// Remove item from cart
export const removeCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.id;
    const quantityToRemove = req.body.quantity;

    logger.debug("Remove from cart attempt", {
      userId,
      productId,
      quantityToRemove,
    });

    const cart = await Cart.findOneAndUpdate({ user: userId });

    if (!cart) {
      logger.warn("Cannot remove item - Cart not found", { userId });
      return res.status(404).json({ message: "Cart not found" });
    }

    logger.debug("Cart found, searching for product", {
      userId,
      cartId: cart._id,
      productId,
    });

    const itemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const oldQuantity = cart.products[itemIndex].quantity;
      cart.products[itemIndex].quantity -= quantityToRemove;

      logger.debug("Product quantity reduced", {
        userId,
        productId,
        oldQuantity,
        removedQuantity: quantityToRemove,
        newQuantity: cart.products[itemIndex].quantity,
      });

      // TAMBAHKAN INI: Hapus item jika quantity <= 0
      if (cart.products[itemIndex].quantity <= 0) {
        cart.products.splice(itemIndex, 1); // Hapus item dari array

        logger.info("Product removed from cart (quantity reached 0)", {
          userId,
          productId,
          remainingProducts: cart.products.length,
        });
      }
    } else {
      logger.warn("Product not found in cart", { userId, productId });
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (cart.products.length === 0) {
      // Jika keranjang kosong, hapus keranjang
      await Cart.findOneAndDelete({ user: userId });

      logger.info("Cart deleted - no products remaining", { userId });

      return res.status(200).json({ message: "Cart deleted successfully" });
    }

    await cart.save();

    logger.info("Product removed from cart successfully", {
      userId,
      productId,
      remainingProducts: cart.products.length,
    });

    return res
      .status(200)
      .json({ message: "Product deleted successfully", cart });
  } catch (error) {
    logger.error("Failed to remove product from cart", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
      productId: req.params?.id,
    });

    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
