import { Schema, model, Document, Types } from 'mongoose';

export interface IReport extends Document {
  reporterId: Types.ObjectId;
  targetType: 'user' | 'product' | 'lost_item' | 'found_item';
  targetId: Types.ObjectId;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
}

const reportSchema = new Schema<IReport>({
  reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['user', 'product', 'lost_item', 'found_item'], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const Report = model<IReport>('Report', reportSchema);
