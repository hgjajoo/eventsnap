import mongoose from "mongoose";

const mongoURI: string = process.env.MONGO_URI!;

export async function connect() {
  try {
    await mongoose.connect(mongoURI);
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("Database connected");
    });
    connection.on("error", (err) => {
        console.log("Mongo connection error");
        console.error(err);
        process.exit(1);
    });
  } catch (err) {
    console.log("Error connecting to database");
    console.error(err);
  }
}