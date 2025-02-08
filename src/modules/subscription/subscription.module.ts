import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { ParameterSchema } from 'src/mongoose/parameter';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionLevelSchema } from 'src/mongoose/subscription-level';
import { StoreSubscriptionSchema } from 'src/mongoose/store-subscription';
import { StoreSchema } from 'src/mongoose/store';
import { NotificationSchema } from 'src/mongoose/notification';
import { FirebaseAdminModule } from '../firebase-admin/firebase-admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Parameter', schema: ParameterSchema },
      { name: 'Store', schema: StoreSchema },
      { name: 'SubscriptionLevel', schema: SubscriptionLevelSchema },
      { name: 'StoreSubscription', schema: StoreSubscriptionSchema },
      { name: 'Notification', schema: NotificationSchema },
    ]),
    FirebaseAdminModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
