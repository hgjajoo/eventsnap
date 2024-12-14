import { connect } from "@/db/dbConfig";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { token }: any = reqBody;
    console.log(token); // test, remember to remove later!

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() }, 
    });

    if (!user) {
      return NextResponse.json(
        { err: "Invalid or expired token" },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { msg: "User verified successfully", success: true },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
