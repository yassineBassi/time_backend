import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParameterType } from 'src/common/models/enums/parameter-type';
import { Parameter } from 'src/mongoose/parameter';
import { SubscriptionLevel } from 'src/mongoose/subscription-level';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {

  constructor( 
    @InjectModel('Parameter') 
    private readonly parameterModel: Model<Parameter>,

    @InjectModel('SubscriptionLevel') 
    private readonly subscriptionLevelModel: Model<SubscriptionLevel>
  ){}

  create(createSubscriptionDto: CreateSubscriptionDto) {
    return 'This action adds a new subscription';
  }

  async getTypes(){
    let parameters = (await this.parameterModel.find({
      type: ParameterType.SUBSCRIPTION_TYPE,
      value: "1"
    })).map(p => p.name);

    return parameters;
  }

  async getLevels(){
    let subscriptionLevels = await this.subscriptionLevelModel.find();
    return subscriptionLevels;
  }

  findAll() {
    return `This action returns all subscription`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subscription`;
  }

  update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    return `This action updates a #${id} subscription`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscription`;
  }
}
