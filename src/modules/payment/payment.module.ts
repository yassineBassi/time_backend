import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TapPaymentSchema } from 'src/mongoose/tap-payment';
import { StoreSubscriptionSchema } from 'src/mongoose/store-subscription';
import { SubscriptionLevelSchema } from 'src/mongoose/subscription-level';
import { StoreSchema } from 'src/mongoose/store';
import { ClientSchema } from 'src/mongoose/client';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'TapPayment', schema: TapPaymentSchema },
      { name: 'Client', schema: ClientSchema },
      { name: 'Store', schema: StoreSchema },
      { name: 'SubscriptionLevel', schema: SubscriptionLevelSchema },
      { name: 'StoreSubscription', schema: StoreSubscriptionSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}