import { Module } from '@nestjs/common';
import { AdService } from './ad.service';
import { AdController } from './ad.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AdSchema } from 'src/mongoose/ads';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Ad', schema: AdSchema }])],
  controllers: [AdController],
  providers: [AdService],
})
export class AdModule {}
