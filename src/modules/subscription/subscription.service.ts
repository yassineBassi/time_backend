import { BadRequestException, Injectable } from '@nestjs/common';
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
import { DashboardFilterQuery } from 'src/common/models/dahsboard-filter-query';
import { CreateSubscriptionLevelDTO } from './dto/create-subscription-level.dto';
import { UpdateSubscriptionLevelDTO } from './dto/update-subscription-level.dto';
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

  async getLevelsInDashboard(query: DashboardFilterQuery) {
    const searchFilter = {};

    const levels = await this.subscriptionLevelModel
      .find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(query.skip)
      .limit(query.take);

    console.log(levels);

    return {
      subscriptionPlans: levels,
      count: await this.subscriptionLevelModel.countDocuments(searchFilter),
    };
  }

  async getLevel(levelId: string) {
    const level = await this.subscriptionLevelModel.findById(levelId);
    level.color = '#' + level.color;
    return level;
  }

  async createLevel(request: CreateSubscriptionLevelDTO) {
    console.log(request);

    let level = await this.subscriptionLevelModel.create({
      title: request.title,
      color: request.color.slice(1),
      price: request.price,
      showPrice: request.showPrice,
      reservations: request.reservations,
      verified: request.verified,
      expirationDays: request.expirationDays,
      specialAds: request.specialAds,
      support: request.support,
      specialServices: request.specialServices,
    });

    level = await level.save();

    return level;
  }

  async updateLevel(request: UpdateSubscriptionLevelDTO) {
    console.log(request);

    let level = await this.subscriptionLevelModel.findById(request._id);

    level.title = request.title;
    level.color = request.color.slice(1);
    level.price = request.price;
    level.showPrice = request.showPrice;
    level.reservations = request.reservations;
    level.verified = request.verified;
    level.expirationDays = request.expirationDays;
    level.specialAds = request.specialAds;
    level.support = request.support;
    level.specialServices = request.specialServices;

    level = await level.save();

    return level;
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

    if (subscriptionLevel.verified) store.isVerified = true;

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
        console.log('before 1h subscription reminder');
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
        console.log('before 24h subscription reminder');
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
    subscription: StoreSubscription,
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
