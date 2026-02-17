import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    fullName: string;
    username: string;
    email: string;
    image?: string;
    provider: "google" | "github";
    isVerified: boolean;
    isAdmin: boolean;
    events: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema<IUser>(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
        },
        image: {
            type: String,
            default: "",
        },
        provider: {
            type: String,
            enum: ["google", "github"],
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: true, // OAuth users are always verified
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        events: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Event",
            },
        ],
    },
    { timestamps: true }
);

const User =
    mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
