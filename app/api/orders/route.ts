import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Order from '../../models/Order';

// POST: Save new customer order
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const newOrder = await Order.create(body);
    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to place order' }, { status: 500 });
  }
}

// GET: Fetch all orders for admin view
export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}