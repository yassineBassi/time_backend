import mongoose from 'mongoose';
import { DiscountType } from 'src/common/models/enums/discount-type';
import * as mongooseDelete from 'mongoose-delete';

export const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String },
    picture: { type: String },
    price: { type: Number, default: 0.0 },
    discount: { type: Number },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    discountType: { type: String, enum: Object.values(DiscountType) },
    enabled: { type: Boolean, default: false },
    duration: { type: Number },
    facilities: [{ type: mongoose.Types.ObjectId, ref: 'FacilityItem' }],
  },
  { timestamps: true },
);

ServiceSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: true,
  restore: true,
});

export interface Service extends mongooseDelete.SoftDeleteDocument {
  title: string;
  picture: string;
  price: number;
  discount: number;
  category: mongoose.Schema.Types.ObjectId;
  store: mongoose.Schema.Types.ObjectId;
  discountType: DiscountType;
  enabled: boolean;
  duration: number;
  facilities: mongoose.Types.ObjectId[];
}

export type ServiceModel = mongooseDelete.SoftDeleteModel<Service>;
