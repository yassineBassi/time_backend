import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { SubscriptionStatus } from 'src/common/models/enums/subscription-status';

export const StoreSubscriptionSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionLevel',
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TapPayment' },
    expiredAt: { type: Date },
    notifiedBefore1h: { type: Boolean, default: false },
    notifiedBefore24h: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export interface StoreSubscription extends Document {
  store: mongoose.Schema.Types.ObjectId;
  paymentId: mongoose.Schema.Types.ObjectId;
  subscription: mongoose.Schema.Types.ObjectId;
  status: SubscriptionStatus;
  expiredAt: Date;
  createdAt: Date;
  notifiedBefore1h: boolean;
  notifiedBefore24h: boolean;
}
