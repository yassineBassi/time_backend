import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Store } from 'src/mongoose/store';
import { ServiceCategoryModel } from 'src/mongoose/service-category';

@Injectable()
export class ServiceCategoryService {
  constructor(
    @InjectModel('ServiceCategory')
    private serviceCategoryModel: ServiceCategoryModel,
  ) {}

  async create(
    createServiceCategoryDto: CreateServiceCategoryDto,
    store: Store,
  ) {
    const count = await this.serviceCategoryModel.countDocuments({
      name: createServiceCategoryDto.name,
      store: store.id,
    });

    if (count > 0) {
      throw new BadRequestException('errors.category_already_exist');
    }

    let category = new this.serviceCategoryModel({
      name: createServiceCategoryDto.name,
      store: store.id,
    });
    category = await category.save();
    return category;
  }

  async findAll(store: Store) {
    const categories = await this.serviceCategoryModel
      .find({
        store: store.id,
        deletedAt: null,
      })
      .populate('services')
      .populate('services.category');

    return categories;
  }

  async fetchByStoreId(storeId: string) {
    const categories = await this.serviceCategoryModel
      .find({
        store: storeId,
      })
      .select('_id name');
    return categories;
  }

  async remove(id: string) {
    const result = await this.serviceCategoryModel.delete({ _id: id });
    return result;
  }
}
