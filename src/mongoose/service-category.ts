import mongoose from 'mongoose';
import * as mongooseDelete from 'mongoose-delete';

export const ServiceCategorySchema = new mongoose.Schema(
  {
    name: { type: String },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ServiceCategorySchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: true,
  restore: true,
});

export interface ServiceCategory
  extends Document,
    mongooseDelete.SoftDeleteDocument {
  name: string;
  store: mongoose.Schema.Types.ObjectId;
  services: mongoose.Schema.Types.ObjectId[];
  deletedAt: Date;
}

export type ServiceCategoryModel =
  mongooseDelete.SoftDeleteModel<ServiceCategory>;
