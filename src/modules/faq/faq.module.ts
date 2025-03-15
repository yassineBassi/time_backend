import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FAQSchema } from 'src/mongoose/faq';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'FAQ', schema: FAQSchema }])],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}
