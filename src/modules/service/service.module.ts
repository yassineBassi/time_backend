import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceCategorySchema } from 'src/mongoose/service-category';
import { ServiceSchema } from 'src/mongoose/service';
import { StoreSchema } from 'src/mongoose/store';
import { SubscriptionModule } from '../subscription/subscription.module';
import { FacilitySchema } from 'src/mongoose/facility';
import { FacilityItemSchema } from 'src/mongoose/facility-item';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ServiceCategory', schema: ServiceCategorySchema },
      { name: 'Service', schema: ServiceSchema },
      { name: 'Store', schema: StoreSchema }
    ]),
    SubscriptionModule
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}