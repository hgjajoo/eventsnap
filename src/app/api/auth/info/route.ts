import { connect } from "@/db/dbConfig";
import { dataFromToken } from "@/helpers/dataFromToken.helper";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request: NextRequest) {
  try {
    const userId = await dataFromToken(request);
    const user = await User.findById({ _id: userId }).select("-password");
    return NextResponse.json({
      msg: "User data fetched successfully",
      data: user,
    });
  } catch (err: any) {
    return NextResponse.json({ err: err.message }, { status: 500 });
  }
}
