import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  customerName: string;
  customerPhone: string;
  orderType: 'Drive-Thru' | 'In-Shop QR' | 'Delivery';
  pickupTime?: string;
  deliveryAddress?: string;
  paymentMethod: 'Cash' | 'Card';
  paymentStatus: 'Pending' | 'Paid';
  items: Array<{
    name: string;
    price: string;
    quantity: number;
  }>;
  totalAmount: number;
  status: 'Pending' | 'Preparing' | 'Completed' | 'Cancelled';
  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    orderType: { 
      type: String, 
      enum: ['Drive-Thru', 'In-Shop QR', 'Delivery'], 
      required: true 
    },
    pickupTime: { type: String },
    deliveryAddress: { type: String },
    paymentMethod: { 
      type: String, 
      enum: ['Cash', 'Card'], 
      required: true 
    },
    paymentStatus: { 
      type: String, 
      enum: ['Pending', 'Paid'], 
      default: 'Pending' 
    },
    items: [
      {
        name: { type: String, required: true },
        price: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      default: 'Pending', 
      enum: ['Pending', 'Preparing', 'Completed', 'Cancelled'] 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);