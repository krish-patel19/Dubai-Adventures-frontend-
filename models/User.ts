import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        index: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        select: false, // Don't return password by default
    },
    phone: {
        type: String,
        trim: true,
    },
    nationality: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        enum: ["user", "admin", "partner"],
        default: "user",
    },
    notes: [
        {
            text: String,
            createdAt: { type: Date, default: Date.now },
            author: String,
        }
    ],
    avatar: String,
    status: {
        type: String,
        enum: ["active", "suspended"],
        default: "active",
    },
    isVip: {
        type: Boolean,
        default: false,
    },
    preferences: {
        dietary: [String],
        interests: [String],
        accessibility: String,
    }
}, {
    timestamps: true,
    collection: "users",
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
