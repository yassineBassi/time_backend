import mongoose from 'mongoose';
import { User, UserSchema } from './user';

export const StoreSchema = new mongoose.Schema({
  storeName: { type: String },
  //photos: { type: String },
  commerceNumber: { type: String },
  commerceNumberExpirationDate: { type: Date },
  accountNumber: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreCategory' },
  reviews: { type: Number },
  reviewsCount: { type: Number },
  isVerified: { type: Boolean, default: false },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreSubscription',
  },
  workingTimes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkingTime',
  },
  //services: { type: String },
  //comments: { type: String },
  available: { type: Boolean, default: false },
});

StoreSchema.add(UserSchema.obj);

export interface Store extends User {
  storeName: string;
  //photos: String,
  commerceNumber: string;
  commerceNumberExpirationDate: string;
  accountNumber: string;
  category: mongoose.Schema.Types.ObjectId;
  reviews: string;
  reviewsCount: string;
  isVerified: string;
  subscription: mongoose.Schema.Types.ObjectId;
  workingTimes: mongoose.Schema.Types.ObjectId;
  //services: String,
  //comments: String,
  available: string;
}
