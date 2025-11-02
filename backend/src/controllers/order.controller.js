import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import logger from "../middleware/logger.js";
import { getIO } from "../socket/index.js";

// createOrder
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;

    logger.debug("Create order attempt started", { userId });

    // 1. Ambil cart user + populate produk biar bisa akses harga
    logger.debug("Fetching user cart", { userId });

    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product",
      "price name"
    );

    if (!cart || cart.products.length === 0) {
      logger.warn("Cannot create order - Cart is empty or not found", {
        userId,
        cartExists: !!cart,
        productCount: cart?.products.length || 0,
      });

      return res.status(404).json({ message: "Cart is empty or not found" });
    }

    logger.debug("Cart found with products", {
      userId,
      productCount: cart.products.length,
    });

    // 2. Siapkan data order
    logger.debug("Preparing order data", { userId });

    const products = cart.products.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const totalPrice = cart.products.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    logger.debug("Order data prepared", {
      userId,
      productCount: products.length,
      totalPrice,
    });

    const orderData = {
      user: cart.user,
      products,
      totalPrice,
      status: "pending",
    };

    // 3. Simpan order
    logger.debug("Saving order to database", { userId });

    const order = await Order.create(orderData);

    logger.info("Order created successfully", {
      userId,
      orderId: order._id,
      productCount: products.length,
      totalPrice: order.totalPrice,
      status: order.status,
    });

    // emit real-time
    try {
      const io = getIO();
      io.emit("order:new", { message: "New order created", order });
      logger.info(`📦 New order event emitted for Order ID: ${order._id}`);
    } catch (socketError) {
      logger.error("Failed to emit order:new event", {
        error: socketError.message,
        orderId: order._id,
        userId,
      });
    }

    // 4. Kosongkan cart
    logger.debug("Clearing cart after order creation", {
      userId,
      cartId: cart._id,
    });

    cart.products = [];
    await cart.save();

    logger.debug("Cart cleared successfully", { userId });

    // 5. Return response
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    logger.error("Failed to create order", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
    });

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    logger.debug("Fetching all orders for user", { userId });

    const orders = await Order.find({ user: userId }).populate(
      "products.product",
      "name price"
    );

    if (!orders || orders.length === 0) {
      logger.warn("No orders found for user", { userId });
      return res.status(404).json({ message: "Orders not found" });
    }

    logger.info("Orders retrieved successfully", {
      userId,
      orderCount: orders.length,
    });

    logger.debug("Order details", {
      userId,
      orders: orders.map((order) => ({
        orderId: order._id,
        status: order.status,
        totalPrice: order.totalPrice,
        productCount: order.products.length,
      })),
    });

    return res.status(200).json(orders);
  } catch (error) {
    logger.error("Failed to fetch orders", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
    });

    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const userId = req.user?.userId;

    logger.debug("Update order status attempt", {
      orderId,
      newStatus: status,
      userId,
    });

    const order = await Order.findById(orderId);

    if (!order) {
      logger.warn("Order not found for status update", {
        orderId,
        userId,
      });

      return res.status(404).json({ message: "Order not found" });
    }

    const oldStatus = order.status;

    logger.debug("Order found, updating status", {
      orderId,
      oldStatus,
      newStatus: status,
      userId,
    });

    order.status = status;
    await order.save();

    logger.info("Order status updated successfully", {
      orderId,
      oldStatus,
      newStatus: status,
      userId,
      orderUserId: order.user,
    });

    return res.status(200).json({
      message: "Order status updated successfully",
      order: {
        id: order._id,
        status: order.status,
        totalPrice: order.totalPrice,
      },
    });
  } catch (error) {
    logger.error("Failed to update order status", {
      error: error.message,
      stack: error.stack,
      orderId: req.params?.id,
      newStatus: req.body?.status,
      userId: req.user?.userId,
    });

    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
