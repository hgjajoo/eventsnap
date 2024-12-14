import { connect } from "@/db/dbConfig";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { token, newPassword, confirmPassword }: any = reqBody;

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ err: "Passwords do not match" }, { status: 400 });
    }

    // Find user by recovery token and check token expiry
    const user = await User.findOne({
      recoverytoken: token,
    });

    if (!user) {
      return NextResponse.json({ err: "Invalid or expired token" }, { status: 400 });
    }

    // Hash the new password and update the user document
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    user.password = hashedPassword;
    user.recoverytoken = undefined; // Clear the recovery token
    await user.save();

    return NextResponse.json({ msg: "Password updated successfully" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
