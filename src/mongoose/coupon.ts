import mongoose from 'mongoose';
import * as mongooseDelete from 'mongoose-delete';
import { CouponType } from 'src/common/models/enums/coupon-type';
import { DiscountType } from 'src/common/models/enums/discount-type';
import { UserType } from 'src/common/models/enums/user-type';

export const CouponSchema = new mongoose.Schema(
  {
    code: { type: String },
    discount: { type: Number },
    discountType: { type: String, enum: Object.values(DiscountType) },
    type: { type: String, enum: Object.values(CouponType) },
    consumed: { type: Boolean, default: false },
    userType: { type: String, enum: Object.values(UserType) },
    user: { type: mongoose.Schema.Types.ObjectId, refPath: 'userType' },
    expiredAt: { type: Date },
  },
  { timestamps: true },
);

CouponSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: true,
  restore: true,
});

export interface Coupon extends mongooseDelete.SoftDeleteDocument {
  code: string;
  discount: number;
  discountType: DiscountType;
  type: CouponType;
  consumed: boolean;
  userType: UserType;
  user: mongoose.Schema.Types.ObjectId;
  expiredAt: Date;
}