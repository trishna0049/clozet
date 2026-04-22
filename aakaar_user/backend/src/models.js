const mongoose = require("mongoose");

const printSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    image: { type: String, required: true },
    bannerImage: { type: String, required: true },
    description: { type: String, required: true },
    mood: { type: String, required: true },
    palette: [{ type: String }],
    dropNote: { type: String, required: true },
    limitedLeft: { type: Number, default: 0 },
    bestseller: { type: Boolean, default: false },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    print: { type: mongoose.Schema.Types.ObjectId, ref: "Print", required: true, index: true },
    printId: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    silhouette: { type: String, required: true, index: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    sizes: [{ type: String }],
    images: [{ type: String }],
    fabric: { type: String, required: true },
    description: { type: String, required: true },
    fit: { type: String, required: true },
    details: [{ type: String }],
    inventory: { type: Number, default: 0 },
    badge: { type: String, default: "" }
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    savedAddresses: [
      {
        label: String,
        fullName: String,
        phone: String,
        line1: String,
        city: String,
        state: String,
        pincode: String
      }
    ]
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productTitle: String,
        silhouette: String,
        printName: String,
        image: String,
        size: String,
        quantity: Number,
        price: Number
      }
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      city: String,
      state: String,
      pincode: String
    },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    paymentMethod: { type: String, default: "Cash on Delivery" },
    paymentStatus: { type: String, default: "pending" }
  },
  { timestamps: true }
);

const Print = mongoose.models.Print || mongoose.model("Print", printSchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

module.exports = {
  mongoose,
  Print,
  Product,
  User,
  Order
};
