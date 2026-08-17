import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  studentId: string;
  department: string;
  year: number;
  phone: string;
  passwordHash: string;
  role: 'student' | 'admin';
  profileImage: string;
  status: 'active' | 'suspended';
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  studentId: { type: String, default: '' },
  department: { type: String, default: 'General' },
  year: { type: Number, default: 1, min: 1, max: 5 },
  phone: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  profileImage: { type: String, default: '' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export const User = model<IUser>('User', userSchema);
