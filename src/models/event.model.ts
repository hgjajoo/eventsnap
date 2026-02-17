import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEvent extends Document {
  name: string;
  code: string;
  owner: Types.ObjectId;
  description?: string;
  date?: Date;
  status: "draft" | "active" | "archived";
  photoCount: number;
  attendeesAccessed: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 6,
      maxlength: 6,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Event must have an owner"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "active",
    },
    photoCount: {
      type: Number,
      default: 0,
    },
    attendeesAccessed: [
      {
        type: Schema.Types.ObjectId,
        ref: "Attendee",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate a unique 6-char alphanumeric code
eventSchema.statics.generateUniqueCode = async function (): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code: string;
  let exists = true;

  do {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await this.findOne({ code });
    exists = !!existing;
  } while (exists);

  return code;
};

const Event =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;
