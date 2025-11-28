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
 * @param {File} data.image
 */
export const createProduct = async (data) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("price", parseFloat(data.price));
  formData.append("description", data.description);
  formData.append("category", data.category);
  formData.append("stock", parseInt(data.stock));
  formData.append("images", data.image);

  const response = await api.post("/products", formData);

  console.log(response.data);

  return response.data;
};

/**
 * Get all products
 */
export const getProducts = async () => {
  const response = await api.get("/products");
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

  if (data.image) {
    formData.append("image", data.image);
  }

  const response = await api.put(`${PRODUCTS_ENDPOINT}/${id}`, formData);

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
