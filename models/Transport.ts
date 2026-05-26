import mongoose from "mongoose";

const transportSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ["Shared", "Private", "Luxury"],
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  driverName: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Available", "In-Transit", "Maintenance"],
    default: "Available",
  }
}, {
  timestamps: true,
  collection: "transports"
});

const Transport = mongoose.models.Transport || mongoose.model("Transport", transportSchema);

export default Transport;
