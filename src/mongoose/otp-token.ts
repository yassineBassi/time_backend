import mongoose from 'mongoose';
import { User } from './user';

export const OtpTokenSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    expireDate: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export interface OtpToken extends User {
  code: string;
  expireDate: Date;
  user: mongoose.Schema.Types.ObjectId;
}
