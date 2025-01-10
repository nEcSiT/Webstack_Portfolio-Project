const mongoose = require("mongoose");
const Rider = require("./rider");

const orderSchema = new mongoose.Schema({
  cart: {
    type: Array,
    required: true,
  },
  shippingAddress: {
    type: Object,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Processing",
  },
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rider: {
    type: Object,
    
  },
});

orderSchema.pre('save', async function (next) {
  try {
    const availableRiders = await Rider.find({ isAvailable: true });
    if (availableRiders.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableRiders.length);
      const selectedRider = availableRiders[randomIndex];
      this.rider = selectedRider.toObject(); // Embed the entire rider object
      console.log(`Assigned rider ${this.rider.name} to order`);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Create the Order model
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
