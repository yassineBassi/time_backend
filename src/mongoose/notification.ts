import mongoose from 'mongoose';
import { NotificationReference } from 'src/common/models/enums/notification-reference';
import { NotificationType } from 'src/common/models/enums/notification-type';
import { UserType } from 'src/common/models/enums/user-type';

export const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    receiverType: { type: String, enum: Object.values(UserType) },
    receiver: { type: mongoose.Schema.Types.ObjectId, refPath: 'receiverType' },
    type: { type: String, enum: Object.values(NotificationType) },
    referenceType: { type: String, enum: Object.values(NotificationReference) },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceType',
    },
  },
  { timestamps: true },
);

export interface Notification {
  title: string;
  description: string;
  receiverType: string;
  receiver: mongoose.Schema.Types.ObjectId;
  type: string;
  referenceType: string;
  reference: mongoose.Schema.Types.ObjectId;
}
