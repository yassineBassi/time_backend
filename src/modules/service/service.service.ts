import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ServiceModel } from 'src/mongoose/service';
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
    console.log('service : ', createServiceDto);

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

    service = await this.serviceModel.findById(service.id);

    category.services.push(service.id);
    await category.save();

    return service;
  }

  async update(
    updateServiceDto: UpdateServiceDto,
    picture: string,
    store: Store,
  ) {
    console.log('service : ', updateServiceDto);

    const service = await this.serviceModel.findByIdAndUpdate(
      updateServiceDto.id,
      {
        ...(picture
          ? {
              ...updateServiceDto,
              picture,
            }
          : updateServiceDto),
      },
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

  async fetchByCategoryId(categoryId: string) {
    const services = await this.serviceModel
      .find({
        category: categoryId,
        enabled: true,
      })
      .select('_id title picture price duration discount discountType enabled');

    return services;
  }
}
