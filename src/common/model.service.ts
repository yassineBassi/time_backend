import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model,  } from 'mongoose';
import { ClientModel } from 'src/mongoose/client';

@Injectable()
export class ModelService {
  private models: { [key: string]: Model<any> } = {};

  constructor(
    @InjectModel('Client') private readonly clientModel: ClientModel,
  ) {
    this.models['Client'] = this.clientModel;
  }

  getModel(modelName: string): Model<any> | null {
    console.log(this.models)
    return this.models[modelName] || null;
  }
}