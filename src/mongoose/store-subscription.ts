import mongoose from 'mongoose';

export const StoreSubscriptionSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionLevel',
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TapPayment' },
  },
  { timestamps: true },
);

export interface StoreSubscription {
  storeId: mongoose.Schema.Types.ObjectId;
  subscriptionId: mongoose.Schema.Types.ObjectId;
  paymentId: mongoose.Schema.Types.ObjectId;
  subscription: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}
