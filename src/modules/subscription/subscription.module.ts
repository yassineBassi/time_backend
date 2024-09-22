import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { ParameterSchema } from 'src/mongoose/parameter';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionLevelSchema } from 'src/mongoose/subscription-level';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Parameter', schema: ParameterSchema },
      { name: 'SubscriptionLevel', schema: SubscriptionLevelSchema },
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
