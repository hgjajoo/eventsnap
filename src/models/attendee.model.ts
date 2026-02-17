import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAttendeeActivity {
    event: Types.ObjectId;
    accessedAt: Date;
    downloaded: boolean;
    downloadedAt?: Date;
}

export interface IAttendee extends Document {
    name: string;
    email: string;
    eventsAccessed: IAttendeeActivity[];
    createdAt: Date;
    updatedAt: Date;
}

const attendeeActivitySchema = new Schema<IAttendeeActivity>(
    {
        event: {
            type: Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        accessedAt: {
            type: Date,
            default: Date.now,
        },
        downloaded: {
            type: Boolean,
            default: false,
        },
        downloadedAt: {
            type: Date,
        },
    },
    { _id: false }
);

const attendeeSchema = new Schema<IAttendee>(
    {
        name: {
            type: String,
            required: [true, "Attendee name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Attendee email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        eventsAccessed: [attendeeActivitySchema],
    },
    {
        timestamps: true,
    }
);

const Attendee =
    mongoose.models.Attendee ||
    mongoose.model<IAttendee>("Attendee", attendeeSchema);

export default Attendee;
