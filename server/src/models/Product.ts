import { Schema, model, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  sellerId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  images: string[];
  location: string;
  status: 'available' | 'sold' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  condition: { type: String, enum: ['new', 'like_new', 'good', 'fair'], required: true },
  images: { type: [String], default: [] },
  location: { type: String, required: true },
  status: { type: String, enum: ['available', 'sold', 'paused'], default: 'available' }
}, {
  timestamps: true
});

export const Product = model<IProduct>('Product', productSchema);
