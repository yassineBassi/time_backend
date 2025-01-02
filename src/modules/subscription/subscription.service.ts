import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParameterType } from 'src/common/models/enums/parameter-type';
import { Parameter } from 'src/mongoose/parameter';
import { SubscriptionLevel } from 'src/mongoose/subscription-level';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { StoreSubscription } from 'src/mongoose/store-subscription';
import { Store } from 'src/mongoose/store';
import { SubscriptionStatus } from 'src/common/models/enums/subscription-status';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel('Parameter')
    private readonly parameterModel: Model<Parameter>,
    @InjectModel('SubscriptionLevel')
    private readonly subscriptionLevelModel: Model<SubscriptionLevel>,
    @InjectModel('StoreSubscription')
    private readonly storeSubscriptionModel: Model<StoreSubscription>,
  ) {}

  create(createSubscriptionDto: CreateSubscriptionDto) {
    return 'This action adds a new subscription';
  }

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
    console.log(store.id);

    if (!store.subscription) return false;

    const subscription = await this.storeSubscriptionModel.findById(
      store.subscription,
    );
    const subscriptionLevel = await this.subscriptionLevelModel.findById(
      subscription.subscriptionId,
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
      storeSubscription.subscriptionId,
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
}
