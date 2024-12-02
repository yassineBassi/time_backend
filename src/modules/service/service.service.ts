import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceModel } from 'src/mongoose/service';
import { Store } from 'src/mongoose/store';
import { ServiceCategory } from 'src/mongoose/service-category';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel('Service')
    private readonly serviceModel: ServiceModel,
    @InjectModel('ServiceCategory')
    private readonly serviceCategory: Model<ServiceCategory>,
    @InjectModel('Store')
    private readonly storeModel: Model<Store>,
  ) {}

  async create(
    createServiceDto: CreateServiceDto,
    picture: string,
    store: Store,
  ) {
    const category = await this.serviceCategory.findById(
      createServiceDto.categoryId,
    );

    if (!category) {
      throw new BadRequestException();
    }

    let service = new this.serviceModel(createServiceDto);
    service.picture = picture;
    service.category = category.id;
    service.store = (await this.storeModel.findById(store.id)).id;

    service = await service.save();

    category.services.push(service.id);
    await category.save();

    return service;
  }

  async update(
    updateServiceDto: UpdateServiceDto,
    picture: string,
    store: Store,
  ) {
    console.log('dto : ', updateServiceDto);
    console.log('file : ', picture);
    console.log('store : ', store);

    const service = await this.serviceModel.findByIdAndUpdate(
      updateServiceDto.id,
      picture
        ? {
            ...updateServiceDto,
            picture,
          }
        : updateServiceDto,
      {
        new: true,
      },
    );

    if (!service) {
      return new NotFoundException('service not found');
    }

    return service;
  }

  async toggleService(serviceId: string) {
    let service = await this.serviceModel.findById(serviceId);
    service.enabled = !service.enabled;

    service = await service.save();

    return {
      result: service.enabled,
    };
  }

  async remove(id: string) {
    console.log('delete service', id);
    const result = await this.serviceModel.delete({ _id: id });
    console.log('res', result);
    return result;
  }
}
