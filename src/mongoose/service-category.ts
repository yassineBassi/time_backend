import mongoose from 'mongoose';

export const ServiceCategorySchema = new mongoose.Schema(
  {
    name: { type: String },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export interface ServiceCategory {
  name: string;
  storeId: mongoose.Schema.Types.ObjectId;
  services: mongoose.Schema.Types.ObjectId[];
  deletedAt: Date;
}
