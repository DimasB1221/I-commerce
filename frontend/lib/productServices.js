import api from "@/lib/api"; // adjust path to your api file

const PRODUCTS_ENDPOINT = "/products";

/**
 * Create a new product with image upload
 * @param {Object} data - Product data
 * @param {string} data.name
 * @param {number} data.price
 * @param {string} data.description
 * @param {string} data.category
 * @param {number} data.stock
 * @param {File} data.images
 */
export const createProduct = async (data) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("price", parseFloat(data.price));
  formData.append("description", data.description);
  formData.append("category", data.category);
  formData.append("stock", parseInt(data.stock));
  formData.append("images", data.images);

  const response = await api.post("/products", formData, {
    headers: { "Content-Type": undefined },
  });

  return response.data;
};

/**
 * Get all products
 */
export const getProducts = async (pageNumber, limit) => {
  const response = await api.get(`${PRODUCTS_ENDPOINT}`, {
    params: {
      page: pageNumber,
      limit: limit,
    },
  });
  console.log(response.data);
  return response.data;
};

/**
 * Get product by ID
 * @param {string} id
 */
export const getProductById = async (id) => {
  const response = await api.get(`${PRODUCTS_ENDPOINT}/${id}`);
  return response.data;
};

/**
 * Update product
 * @param {string} id
 * @param {Object} data - Product data (image is optional)
 */
export const updateProduct = async (id, data) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("price", parseFloat(data.price));
  formData.append("description", data.description);
  formData.append("category", data.category);
  formData.append("stock", parseInt(data.stock));

  if (data.images) {
    formData.append("images", data.images);
  }

  const token = localStorage.getItem("token");
  console.log("Update Product - ID:", id);

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await api.put(`${PRODUCTS_ENDPOINT}/${id}`, formData, {
    headers: {
      "Content-Type": undefined,
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Delete product
 * @param {string} id
 */
export const deleteProduct = async (id) => {
  const response = await api.delete(`${PRODUCTS_ENDPOINT}/${id}`);
  return response.data;
};
