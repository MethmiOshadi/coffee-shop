import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import MenuItem from '../../models/MenuItem';

// GET: Read all menu items
export async function GET() {
  try {
    await dbConnect();
    const items = await MenuItem.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
  }
}

// POST: Create a new menu item
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const newItem = await MenuItem.create(body);
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
  }
}

// PUT: Update an existing menu item
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, data: updatedItem }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE: Remove a menu item by ID
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }

    await MenuItem.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Item deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}