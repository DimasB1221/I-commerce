import mongoose, { Schema } from "mongoose";
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    orders: { type: [Schema.Types.ObjectId], ref: "Order" },
    cart: { type: [Schema.Types.ObjectId], ref: "Product" },
  },
  { timestamps: true }
);

export default mongoose.model("Users", userSchema);
