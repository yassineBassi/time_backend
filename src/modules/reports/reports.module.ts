import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppReportSchema } from 'src/mongoose/app-report';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'AppReport', schema: AppReportSchema }]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
