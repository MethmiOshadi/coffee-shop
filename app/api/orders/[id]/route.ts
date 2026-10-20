import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { status, paymentStatus } = await request.json();

    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      { 
        ...(status && { status }), 
        ...(paymentStatus && { paymentStatus }) 
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
  }
}