import mongoose from 'mongoose';
import { User, UserSchema } from './user';
import { DiscountType } from 'src/common/models/enums/discount-type';

export const ServiceSchema = new mongoose.Schema({
  title: { type: String },
  picture: { type: String },
  price: { type: Number, default: 0.0 },
  discount: { type: Number },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
  discountType: { type: String, enum: Object.values(DiscountType) },
  enabled: { type: Boolean },
  duration: { type: Number },
});

ServiceSchema.add(UserSchema.obj);

export interface Service extends User {
  title: string;
  picture: string;
  price: number;
  discount: number;
  category: mongoose.Schema.Types.ObjectId;
  discountType: DiscountType;
  enabled: boolean;
  duration: number;
  //  facilities: List<Facility>;
}
