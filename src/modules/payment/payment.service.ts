import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ReservationStatus } from 'src/common/models/enums/reservation-status';
import { Client } from 'src/mongoose/client';
import { Reservation } from 'src/mongoose/reservation';
import { Store } from 'src/mongoose/store';
import { StoreSubscription } from 'src/mongoose/store-subscription';
import { SubscriptionLevel } from 'src/mongoose/subscription-level';
import { TapPayment } from 'src/mongoose/tap-payment';
import { GiftService } from '../gift/gift.service';
import { Coupon } from 'src/mongoose/coupon';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel('TapPayment')
    private readonly tapPaymentModel: Model<TapPayment>,
    @InjectModel('Client')
    private readonly clientModel: Model<Client>,
    @InjectModel('Store')
    private readonly storeModel: Model<Store>,
    @InjectModel('SubscriptionLevel')
    private readonly subscriptionLevelModel: Model<SubscriptionLevel>,
    @InjectModel('StoreSubscription')
    private readonly storeSubscriptionModel: Model<StoreSubscription>,
    @InjectModel('Reservation')
    private readonly reservationModel: Model<Reservation>,
    @InjectModel('Coupon')
    private readonly couponModel: Model<Coupon>,
    private readonly giftService: GiftService,
  ) {}

  async callback(request: any) {
    console.log('callback');
    console.log(request);

    const metadata = request.metadata;

    // timestamp + utc zone to date
    let date = new Date(parseInt(request.transaction.created));

    const timezone =
      parseInt(request.transaction.timezone.split('UTC')[1]) * -60;
    date = new Date(date.getTime() + timezone * 60 * 1000);

    let tapPayment = new this.tapPaymentModel({
      transaction_id: request.id,
      tyoe: request.object,
      version: request.api_version,
      statut: request.status,
      amount: request.amount,
      currency: request.currency,
      isThreeDSecure: request.threeDSecure,
      transaction_date: date,
      customer_id: metadata.userId,
      customer_type: metadata.userType,
      customer_name:
        request.customer.first_name + ' ' + request.customer.last_name,
      customer_email: request.customer.email,
      customer_phone_number:
        '+' +
        request.customer.phone.country_code +
        request.customer.phone.number,
      merchant_id: request.merchant.id,
      type: metadata.type,
    });

    tapPayment = await tapPayment.save();

    if (metadata.type == 'gift') {
      await this.giftService.handleGiftCallback(
        metadata,
        tapPayment.id,
        tapPayment.statut,
      );
    } else if (tapPayment.statut == 'CAPTURED') {
      if (metadata.type == 'reservation') {
        return this.handleReservationCallback(
          metadata,
          tapPayment.id,
          request.amount,
        );
      } else {
        return this.handleSubscrptionCallback(metadata, tapPayment.id);
      }
    }

    return false;
  }

  async handleReservationCallback(
    metadata: any,
    tapPaymentId: any,
    amount: number,
  ) {
    const reservation = await this.reservationModel.findById(metadata.id);
    reservation.status = ReservationStatus.PAYED;
    reservation.payment = tapPaymentId;

    if (metadata.coupon) {
      const coupon = await this.couponModel.findById(metadata.coupon);
      reservation.coupon = coupon.id;
      coupon.consumed = true;
      await coupon.save();
    }

    reservation.payedPrice = amount;
    await reservation.save();

    return true;
  }

  async handleSubscrptionCallback(metadata: any, tapPaymentId: any) {
    let store = await this.storeModel.findById(metadata.userId);
    const subscriptionLevel = await this.subscriptionLevelModel.findById(
      metadata.id,
    );

    let subscription = new this.storeSubscriptionModel({
      storeId: store.id,
      subscriptionId: subscriptionLevel.id,
      paymentId: tapPaymentId,
    });

    subscription = await subscription.save();

    console.log('subscription: ', subscription);

    store.subscription = subscription.id;
    store = await store.save();

    console.log('subscription captured');

    return true;
  }
}
