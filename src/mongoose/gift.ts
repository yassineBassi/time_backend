import mongoose from 'mongoose';
import { GiftStatus } from 'src/common/models/enums/gift-status';
import { UserType } from 'src/common/models/enums/user-type';

export const GiftSchema = new mongoose.Schema(
  {
    giftCard: { type: mongoose.Schema.Types.ObjectId, ref: 'GiftCard' },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    price: { type: Number },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'TapPayment' },
    status: { type: String, enum: Object.values(GiftStatus) },
    userType: { type: String, enum: Object.values(UserType) },
    user: { type: mongoose.Schema.Types.ObjectId, refPath: 'userType' },
  },
  { timestamps: true },
);

export interface Gift {
  giftCard: mongoose.Schema.Types.ObjectId;
  coupon: mongoose.Schema.Types.ObjectId;
  payment: mongoose.Schema.Types.ObjectId;
  price: number;
  status: string;
  userType: string;
  user: mongoose.Schema.Types.ObjectId;
}
