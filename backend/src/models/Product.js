import mongoose from "mongoose";
import "dotenv/config";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
