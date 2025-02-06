import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ParameterType } from 'src/common/models/enums/parameter-type';
import { Parameter } from 'src/mongoose/parameter';

@Injectable()
export class ParamsService {
  constructor(
    @InjectModel('Parameter')
    private paramsModel: Model<Parameter>,
  ) {}

  async getAppLinks() {
    console.log('params');

    return {
      appStoreLink: (
        await this.paramsModel.findOne({
          type: ParameterType.APP_LINKS,
          name: 'appStoreLink',
        })
      ).value,
      playStoreLink: (
        await this.paramsModel.findOne({
          type: ParameterType.APP_LINKS,
          name: 'playStoreLink',
        })
      ).value,
      message: 'use the app : ',
    };
  }

  fetchTva() {
    return 15;
  }

  async getWorkingDays() {
    return [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
  }

  async getWorkingTimes() {
    return [
      '12:00 am',
      '12:15 am',
      '12:30 am',
      '12:45 am',
      '01:00 am',
      '01:15 am',
      '01:30 am',
      '01:45 am',
      '02:00 am',
      '02:15 am',
      '02:30 am',
      '02:45 am',
      '03:00 am',
      '03:15 am',
      '03:30 am',
      '03:45 am',
      '04:00 am',
      '04:15 am',
      '04:30 am',
      '04:45 am',
      '05:00 am',
      '05:15 am',
      '05:30 am',
      '05:45 am',
      '06:00 am',
      '06:15 am',
      '06:30 am',
      '06:45 am',
      '07:00 am',
      '07:15 am',
      '07:30 am',
      '07:45 am',
      '08:00 am',
      '08:15 am',
      '08:30 am',
      '08:45 am',
      '09:00 am',
      '09:15 am',
      '09:30 am',
      '09:45 am',
      '10:00 am',
      '10:15 am',
      '10:30 am',
      '10:45 am',
      '11:00 am',
      '11:15 am',
      '11:30 am',
      '11:45 am',
      '12:00 pm',
      '12:15 pm',
      '12:30 pm',
      '12:45 pm',
      '01:00 pm',
      '01:15 pm',
      '01:30 pm',
      '01:45 pm',
      '02:00 pm',
      '02:15 pm',
      '02:30 pm',
      '02:45 pm',
      '03:00 pm',
      '03:15 pm',
      '03:30 pm',
      '03:45 pm',
      '04:00 pm',
      '04:15 pm',
      '04:30 pm',
      '04:45 pm',
      '05:00 pm',
      '05:15 pm',
      '05:30 pm',
      '05:45 pm',
      '06:00 pm',
      '06:15 pm',
      '06:30 pm',
      '06:45 pm',
      '07:00 pm',
      '07:15 pm',
      '07:30 pm',
      '07:45 pm',
      '08:00 pm',
      '08:15 pm',
      '08:30 pm',
      '08:45 pm',
      '09:00 pm',
      '09:15 pm',
      '09:30 pm',
      '09:45 pm',
      '10:00 pm',
      '10:15 pm',
      '10:30 pm',
      '10:45 pm',
      '11:00 pm',
      '11:15 pm',
      '11:30 pm',
      '11:45 pm',
    ];
  }
}
