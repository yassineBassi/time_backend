import mongoose from 'mongoose';
import { User, UserSchema } from './user';

export const ServiceCaregorySchema = new mongoose.Schema({
  storeName: { type: String },
  commerceNumber: { type: String },
  commerceNumberExpirationDate: { type: Date },
  accountNumber: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreCategory' },
  reviews: { type: Number },
  reviewsCount: { type: Number },
  isVerified: { type: Boolean, default: false },
  available: { type: Boolean, default: false },
});

ServiceCaregorySchema.add(UserSchema.obj);

export interface ServiceCaregory extends User {
  storeName: string;
  commerceNumber: string;
  commerceNumberExpirationDate: string;
  accountNumber: string;
  category: mongoose.Schema.Types.ObjectId;
  reviews: string;
  reviewsCount: string;
  isVerified: string;
  available: string;
}
