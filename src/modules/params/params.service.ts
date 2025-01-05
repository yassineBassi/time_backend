import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
}
