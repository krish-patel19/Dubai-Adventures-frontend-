import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ["unread", "read", "replied"],
        default: "unread",
    },
}, {
    timestamps: true,
    collection: "contacts",
});

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
export default Contact;
