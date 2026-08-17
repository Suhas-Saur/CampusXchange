import { Schema, model, Document, Types } from 'mongoose';

export interface IFoundItem extends Document {
  userId: Types.ObjectId;
  title: string;
  category: string;
  description: string;
  location: string;
  dateFound: Date;
  images: string[];
  status: 'found' | 'resolved';
  createdAt: Date;
}

const foundItemSchema = new Schema<IFoundItem>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  dateFound: { type: Date, required: true },
  images: { type: [String], default: [] },
  status: { type: String, enum: ['found', 'resolved'], default: 'found' },
  createdAt: { type: Date, default: Date.now }
});

export const FoundItem = model<IFoundItem>('FoundItem', foundItemSchema);
