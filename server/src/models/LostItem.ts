import { Schema, model, Document, Types } from 'mongoose';

export interface ILostItem extends Document {
  userId: Types.ObjectId;
  title: string;
  category: string;
  description: string;
  location: string;
  dateLost: Date;
  images: string[];
  status: 'lost' | 'resolved';
  createdAt: Date;
}

const lostItemSchema = new Schema<ILostItem>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  dateLost: { type: Date, required: true },
  images: { type: [String], default: [] },
  status: { type: String, enum: ['lost', 'resolved'], default: 'lost' },
  createdAt: { type: Date, default: Date.now }
});

export const LostItem = model<ILostItem>('LostItem', lostItemSchema);
