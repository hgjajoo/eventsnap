import { connect } from "@/db/dbConfig";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mail.helper";

connect();  

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { fullName, username, email, phone, password }: any = reqBody;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ err: "User already exists" }, { status: 400 });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      phone,
      password: hashedPassword,
      isVerified: false,
      userPlan: "Free",
      userPlanStartDate: null,
      userEvents: [],
    });

    const savedUser = await newUser.save();
    console.log(savedUser);

    await sendEmail({
      email,
      emailType: "VERIFY",
      userId: savedUser._id,
    });

    return NextResponse.json(
      { msg: "User created successfully. Please check your email to verify your account.", success: true, savedUser },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
