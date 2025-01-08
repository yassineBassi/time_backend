import mongoose from 'mongoose';
import * as mongooseDelete from 'mongoose-delete';

export const StoreReviewSchema = new mongoose.Schema(
  {
    rate: { type: Number, required: true, max: 5, min: 0 },
    comment: { type: String },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  },
  { timestamps: true },
);

export interface StoreReview extends mongooseDelete.SoftDeleteDocument {
  rate: number;
  comment: string;
  client: mongoose.Schema.Types.ObjectId;
  store: mongoose.Schema.Types.ObjectId;
}

export type StoreReviewModel = mongooseDelete.SoftDeleteModel<StoreReview>;
