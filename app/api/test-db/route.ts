import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ success: true, message: "Successfully connected to MongoDB Atlas!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to connect to database." }, { status: 500 });
  }
}