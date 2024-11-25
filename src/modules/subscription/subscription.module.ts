import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { ParameterSchema } from 'src/mongoose/parameter';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionLevelSchema } from 'src/mongoose/subscription-level';
import { StoreSubscriptionSchema } from 'src/mongoose/store-subscription';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Parameter', schema: ParameterSchema },
      { name: 'SubscriptionLevel', schema: SubscriptionLevelSchema },
      { name: 'StoreSubscription', schema: StoreSubscriptionSchema },
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService]
})
export class SubscriptionModule {}
