import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParameterType } from 'src/common/models/enums/parameter-type';
import { Parameter } from 'src/mongoose/parameter';
import { SubscriptionLevel } from 'src/mongoose/subscription-level';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Store } from 'src/mongoose/store';
import { SubscriptionStatus } from 'src/common/models/enums/subscription-status';
import { Cron } from '@nestjs/schedule';
import { Notification } from 'src/mongoose/notification';
import { I18nService } from 'nestjs-i18n';
import { FirebaseAdminService } from '../firebase-admin/firebase-admin.service';
import { NotificationType } from 'src/common/models/enums/notification-type';
import { NotificationReference } from 'src/common/models/enums/notification-reference';
import { UserType } from 'src/common/models/enums/user-type';
import { StoreSubscription } from 'src/mongoose/store-subscription';
const moment = require('moment');

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel('Parameter')
    private readonly parameterModel: Model<Parameter>,
    @InjectModel('SubscriptionLevel')
    private readonly subscriptionLevelModel: Model<SubscriptionLevel>,
    @InjectModel('StoreSubscription')
    private readonly storeSubscriptionModel: Model<StoreSubscription>,
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
    @InjectModel('Store')
    private readonly storeModel: Model<Store>,
    private readonly i18n: I18nService,
    private firebaseAdminService: FirebaseAdminService,
  ) {}

  async getTypes() {
    const parameters = (
      await this.parameterModel.find({
        type: ParameterType.SUBSCRIPTION_TYPE,
        value: '1',
      })
    ).map((p) => p.name);

    return parameters;
  }

  async getLevels() {
    const subscriptionLevels = await this.subscriptionLevelModel.find();
    return subscriptionLevels;
  }

  async checkStoreSubscription(store: Store) {
    if (!store.subscription) return false;

    const subscription = await this.storeSubscriptionModel.findById(
      store.subscription,
    );

    if (!subscription) return false;

    const subscriptionLevel = await this.subscriptionLevelModel.findById(
      subscription.subscription,
    );

    const expireDate = new Date(
      subscription.createdAt.getTime() +
        subscriptionLevel.expirationDays * 24 * 3600 * 1000,
    );

    if (new Date() > expireDate) {
      console.log('expired');
      return false;
    }

    return true;
  }

  async getMySubscription(store: Store) {
    const storeSubscription = await this.storeSubscriptionModel.findById(
      store.subscription,
    );
    const subscription = await this.subscriptionLevelModel.findById(
      storeSubscription.subscription,
    );

    const date = new Date(
      new Date(storeSubscription.createdAt).getTime() +
        subscription.expirationDays * 24 * 60 * 60 * 1000,
    );

    return {
      expireDate: date,
      status: storeSubscription.status,
      subscription,
    };
  }

  async cancelSubscription(store: Store) {
    await this.storeSubscriptionModel.findByIdAndUpdate(store.subscription, {
      status: SubscriptionStatus.CANCELED,
    });

    return {
      status: SubscriptionStatus.CANCELED,
    };
  }

  async handleSubscrptionCallback(metadata: any, tapPaymentId: any) {
    let store = await this.storeModel.findById(metadata.userId);

    const subscriptionLevel = await this.subscriptionLevelModel.findById(
      metadata.id,
    );

    let subscription = new this.storeSubscriptionModel({
      store: store.id,
      subscription: subscriptionLevel.id,
      paymentId: tapPaymentId,
      expiredAt: new Date(
        new Date().getTime() +
          subscriptionLevel.expirationDays * 24 * 60 * 60 * 1000,
      ),
    });

    subscription = await subscription.save();

    store.subscription = subscription.id;
    store = await store.save();

    return true;
  }

  @Cron('*/1 * * * *')
  async subscriptionRminderCron() {
    let currentDate = new Date();
    // add timezone
    currentDate = new Date(
      currentDate.getTime() + currentDate.getTimezoneOffset() * 60 * 1000 * -1,
    );

    // before 1h reminder
    let subscriptions = await this.storeSubscriptionModel
      .find({
        status: SubscriptionStatus.ACTIVE,
        notifiedBefore1h: false,
        expiredAt: {
          $lt: new Date(currentDate.getTime() + 1000 * 60 * 60),
        },
      })
      .populate('subscription');

    console.log(subscriptions);

    if (subscriptions.length) {
      for (const subscription of subscriptions) {
        const store = await this.storeModel.findById(subscription.store);
        this.sendSubscriptionReminderNotification(store, subscription, '1h');
      }
      await this.storeSubscriptionModel.updateMany(
        {
          _id: {
            $in: subscriptions.map((r) => r.id),
          },
        },
        {
          notifiedBefore1h: true,
          notifiedBefore24h: true,
        },
      );
    }

    // before 24h reminder
    const dateAfter24h = new Date(currentDate.getTime() + 1000 * 60 * 60 * 24);
    const endOfDay = new Date(
      moment().endOf('day').toDate().getTime() +
        currentDate.getTimezoneOffset() * 60 * 1000 * -1,
    );

    subscriptions = await this.storeSubscriptionModel
      .find({
        status: SubscriptionStatus.ACTIVE,
        notifiedBefore24h: false,
        expiredAt: {
          $lt: dateAfter24h,
          $gt: endOfDay,
        },
      })
      .select('subscription store');

    if (subscriptions.length) {
      for (const subscription of subscriptions) {
        const store = await this.storeModel.findById(subscription.store);
        this.sendSubscriptionReminderNotification(store, subscription, '24h');
      }
      await this.storeSubscriptionModel.updateMany(
        {
          _id: {
            $in: subscriptions.map((r) => r.id),
          },
        },
        {
          notifiedBefore24h: true,
        },
      );
    }
  }

  async sendSubscriptionReminderNotification(
    store: Store,
    subscription: StoreSubscription,
    reminderTime: string,
  ) {
    const notification = await (
      await this.notificationModel.create({
        title: this.i18n.translate(
          'messages.notification_' +
            NotificationType.SUBSCRIPTION_REMINDER +
            '_' +
            reminderTime +
            '_title',
        ),
        description: this.i18n.translate(
          'messages.notification_' +
            NotificationType.SUBSCRIPTION_REMINDER +
            '_' +
            reminderTime +
            '_description',
        ),
        type: NotificationType.SUBSCRIPTION_REMINDER,
        referenceType: NotificationReference.SUBSCRIPTION,
        reference: subscription.id,
        receiverType: UserType.STORE,
        receiver: store.id,
      })
    ).save();

    this.firebaseAdminService.sendNotification(
      store.notificationToken,
      notification,
    );
  }

  @Cron('*/1 * * * *')
  async subscriptionExpired() {
    let currentDate = new Date();
    // add timezone
    currentDate = new Date(
      currentDate.getTime() + currentDate.getTimezoneOffset() * 60 * 1000 * -1,
    );

    const subscriptions = await this.storeSubscriptionModel
      .find({
        status: SubscriptionStatus.ACTIVE,
        expiredAt: {
          $lt: currentDate,
        },
      })
      .populate('subscription');

    console.log('expired subs', subscriptions);

    if (subscriptions.length) {
      for (const subscription of subscriptions) {
        const store = await this.storeModel.findById(subscription.store);
        store.subscription = null;
        store.save();
        this.sendSubscriptionExpiredNotification(store, subscription);
      }
      await this.storeSubscriptionModel.updateMany(
        {
          _id: {
            $in: subscriptions.map((r) => r.id),
          },
        },
        {
          status: SubscriptionStatus.EXPIRED,
        },
      );
    }
  }

  async sendSubscriptionExpiredNotification(
    store: Store,
    subscription: StoreSubscription
  ) {
    const notification = await (
      await this.notificationModel.create({
        title: this.i18n.translate(
          'messages.notification_' +
            NotificationType.SUBSCRIPTION_EXPIRED +
            '_' +
            'title',
        ),
        description: this.i18n.translate(
          'messages.notification_' +
            NotificationType.SUBSCRIPTION_EXPIRED +
            '_' + 
            'description',
        ),
        type: NotificationType.SUBSCRIPTION_EXPIRED,
        referenceType: NotificationReference.SUBSCRIPTION,
        reference: subscription.id,
        receiverType: UserType.STORE,
        receiver: store.id,
      })
    ).save();

    this.firebaseAdminService.sendNotification(
      store.notificationToken,
      notification,
    );
  }
}
