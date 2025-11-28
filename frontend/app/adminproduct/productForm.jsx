"use client";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone/dropzone.jsx";
import { createProduct } from "@/lib/productServices";

const ProductForm = ({ onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    setError("");
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "",
      stock: "",
    });
    setFiles([]);
  }, []);

  const validateForm = () => {
    const { name, price, description, category, stock } = formData;
    if (!name || !price || !description || !category || !stock) {
      return "Please fill in all fields";
    }
    if (files.length === 0) {
      return "Please upload an image";
    }
    if (parseFloat(price) < 0 || parseInt(stock) < 0) {
      return "Price and stock must be positive numbers";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createProduct({ ...formData, image: files[0] });

      setSuccess("Product created successfully!");
      resetForm();

      // Notify parent component to refresh
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        document.getElementById("my_modal_3")?.close();
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-primary m-4"
        onClick={() => document.getElementById("my_modal_3")?.showModal()}
      >
        Tambah Product
      </button>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box w-11/12 max-w-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          <h3 className="font-bold text-lg mb-4">Tambah Product</h3>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success mb-4">
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <Label htmlFor="name">Name:</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Product name"
              />
            </div>

            <div className="form-control">
              <Label htmlFor="price">Price:</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-control">
              <Label htmlFor="description">Description:</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description"
                className="textarea textarea-bordered w-full h-24"
              />
            </div>

            <div className="form-control">
              <Label htmlFor="category">Category:</Label>
              <Input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                placeholder="Product category"
              />
            </div>

            <div className="form-control">
              <Label htmlFor="stock">Stock:</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-control">
              <Label>Image:</Label>
              <Dropzone
                accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
                onDrop={handleDrop}
                maxFiles={1}
              >
                <DropzoneEmptyState />
                <DropzoneContent />
              </Dropzone>
              {files.length > 0 && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {files[0].name}
                </p>
              )}
            </div>

            <div className="modal-action">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Create Product"
                )}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => document.getElementById("my_modal_3")?.close()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default ProductForm;
