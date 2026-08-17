import { Schema, model, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  pickupLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'processing', 'ready_for_pickup', 'completed', 'cancelled'], default: 'pending' },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String },
  pickupLocation: { type: String }
}, {
  timestamps: true
});

export const Order = model<IOrder>('Order', orderSchema);
