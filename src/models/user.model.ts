import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
    fullName: string;
    username: string;
    email: string;
    phone?: string;
    password?: string;
    provider: "credentials" | "google" | "github";
    image?: string;
    usedStorage: number;
    userPlan: "Free" | "Silver" | "Gold" | "Platinum";
    userPlanExpiry?: Date;
    userPlanStartDate?: Date;
    events: Types.ObjectId[];
    isVerified: boolean;
    verifyToken?: string;
    verifyTokenExpiry?: Date;
    recoveryToken?: string;
    recoveryTokenExpiry?: Date;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        username: {
            type: String,
            unique: true,
            required: [true, "Username is required"],
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            unique: true,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            default: "",
        },
        password: {
            type: String,
            // Not required — OAuth users don't have passwords
        },
        provider: {
            type: String,
            enum: ["credentials", "google", "github"],
            default: "credentials",
        },
        image: {
            type: String,
            default: "",
        },
        usedStorage: {
            type: Number,
            default: 0,
        },
        userPlan: {
            type: String,
            default: "Free",
            enum: ["Free", "Silver", "Gold", "Platinum"],
        },
        userPlanExpiry: Date,
        userPlanStartDate: Date,
        events: [
            {
                type: Schema.Types.ObjectId,
                ref: "Event",
            },
        ],
        isVerified: {
            type: Boolean,
            default: false,
        },
        verifyToken: String,
        verifyTokenExpiry: Date,
        recoveryToken: String,
        recoveryTokenExpiry: Date,
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const User =
    mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
