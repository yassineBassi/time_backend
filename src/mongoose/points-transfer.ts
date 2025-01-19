import mongoose from 'mongoose';
import { UserType } from 'src/common/models/enums/user-type';

export const PointsTransferSchema = new mongoose.Schema(
  {
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    points: { type: Number },
    price: { type: Number },
    userType: { type: String, enum: Object.values(UserType) },
    user: { type: mongoose.Schema.Types.ObjectId, refPath: 'userType' },
  },
  { timestamps: true },
);

export interface PointsTransfer {
  coupon: mongoose.Schema.Types.ObjectId;
  points: number;
  price: number;
  userType: UserType;
  user: mongoose.Schema.Types.ObjectId;
}
