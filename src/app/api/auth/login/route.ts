import { connect } from "@/db/dbConfig";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/helpers/mail.helper";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password, emailForRecovery }: any = reqBody;

    if (emailForRecovery) {
      // Password recovery flow
      const user = await User.findOne({ email: emailForRecovery });
      if (!user) {
        return NextResponse.json({ err: "User not found" }, { status: 404 });
      }

      // Generate recovery token
      const recoveryToken = uuidv4();
      const recoveryTokenExpiry = Date.now() + 600000; // 10 minutes

      // Update user with recovery token
      user.recoverytoken = recoveryToken;
      user.recoveryTokenExpiry = recoveryTokenExpiry;
      await user.save();

      // Send recovery email
      await sendEmail({
        email: emailForRecovery,
        emailType: "RECOVERY",
        userId: user._id,
      });

      return NextResponse.json(
        { msg: "Password recovery email sent. Please check your inbox." },
        { status: 200 }
      );
    } else {
      // Normal login flow
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ err: "User not found" }, { status: 404 });
      }

      const isValidPassword = await bcryptjs.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ err: "Invalid credentials" }, { status: 400 });
      }

      const tokenData = {
        id: user._id,
        username: user.username, 
        email: user.email,
      };

      const token = jwt.sign(tokenData, process.env.JWT_TOKEN_SECRET!, {
        expiresIn: "1h",
      });

      const response = NextResponse.json({
        msg: "Login successful",
        success: true,
      });

      response.cookies.set("token", token, { httpOnly: true });
      return response;
    }
  } catch (err: any) {
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
