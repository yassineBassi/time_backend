import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from 'src/mongoose/notification';
import { User } from 'src/mongoose/user';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
  ) {}

  async getNotifications(user: User) {
    const notifications = await this.notificationModel
      .find({
        receiver: user.id,
        receiverType: user.type,
      })
      .sort({
        createdAt: -1,
      });
    console.log('get notifications', notifications);
    return notifications;
  }
}
