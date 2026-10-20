import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../lib/dbConnect';
import Customer from '../../../models/Customer';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { action, name, phone, password } = await request.json();

    // Clean phone number (remove spaces, dashes)
    const cleanedPhone = phone ? phone.replace(/[\s-]/g, '') : '';

    // Validate 10-digit Sri Lankan phone number format
    const phoneRegex = /^0\d{9}$/;
    if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit phone number starting with 0 (e.g., 0771234567)' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    if (action === 'signup') {
      if (!name) {
        return NextResponse.json({ success: false, error: 'Full name is required' }, { status: 400 });
      }

      const existingCustomer = await Customer.findOne({ phone: cleanedPhone });
      if (existingCustomer) {
        return NextResponse.json({ success: false, error: 'Phone number already registered. Please sign in.' }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newCustomer = await Customer.create({ name, phone: cleanedPhone, passwordHash });

      const response = NextResponse.json({
        success: true,
        customer: { name: newCustomer.name, phone: newCustomer.phone },
      });

      response.cookies.set('customer_session', JSON.stringify({ name: newCustomer.name, phone: newCustomer.phone }), {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    if (action === 'login') {
      const customer = await Customer.findOne({ phone: cleanedPhone });
      if (!customer) {
        return NextResponse.json({ success: false, error: 'Account not found. Please sign up first.' }, { status: 401 });
      }

      const isValid = await bcrypt.compare(password, customer.passwordHash);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Incorrect phone number or password' }, { status: 401 });
      }

      const response = NextResponse.json({
        success: true,
        customer: { name: customer.name, phone: customer.phone },
      });

      response.cookies.set('customer_session', JSON.stringify({ name: customer.name, phone: customer.phone }), {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}