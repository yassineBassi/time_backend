import mongoose from 'mongoose';

export const StoreReportSchema = new mongoose.Schema(
  {
    message: { type: String },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  },
  { timestamps: true },
);

export interface StoreReport {
  message: string;
  client: mongoose.Schema.Types.ObjectId;
  reservation: mongoose.Schema.Types.ObjectId;
  store: mongoose.Schema.Types.ObjectId;
}
