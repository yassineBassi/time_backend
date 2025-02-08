import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TapPayment } from 'src/mongoose/tap-payment';
import { GiftService } from '../gift/gift.service';
import { ReservationService } from '../reservation/reservation.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel('TapPayment')
    private readonly tapPaymentModel: Model<TapPayment>,
    private readonly giftService: GiftService,
    private readonly reservationService: ReservationService,
    private readonly subscriptionService: SubscriptionService,
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
      responeBody: JSON.stringify(request),
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
        return this.reservationService.handleReservationCallback(
          metadata,
          tapPayment.id,
          request.amount,
        );
      } else {
        return this.subscriptionService.handleSubscrptionCallback(
          metadata,
          tapPayment.id,
        );
      }
    }

    return false;
  }
}
