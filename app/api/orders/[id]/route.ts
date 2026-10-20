import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await dbConnect();
    
    // Await params to ensure compatibility across all Next.js versions
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    const body = await request.json();
    const { status, paymentStatus } = body;

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('API Order Update Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}