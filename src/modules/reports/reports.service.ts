import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AppReport } from 'src/mongoose/app-report';
import { User } from 'src/mongoose/user';
import { CreateAppReportDTO } from './dto/create-app-report.dto';
import { Model } from 'mongoose';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel('AppReport')
    private reportModel: Model<AppReport>,
  ) {}

  async reportApp(request: CreateAppReportDTO, user: User) {
    (
      await this.reportModel.create({
        ...request,
        creatorType: user.type,
        createdBy: user.id,
      })
    ).save();

    return {};
  }
}
