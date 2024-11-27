import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceCategory } from 'src/mongoose/service-category';
import { Store } from 'src/mongoose/store';

@Injectable()
export class ServiceCategoryService {
  constructor(
    @InjectModel('ServiceCategory')
    private serviceCategoryModel: Model<ServiceCategory>,
  ) {}

  async create(
    createServiceCategoryDto: CreateServiceCategoryDto,
    store: Store,
  ) {
    const count = await this.serviceCategoryModel.countDocuments({
      name: createServiceCategoryDto.name,
      storeId: store.id,
    });

    if (count > 0) {
      throw new BadRequestException('errors.category_already_exist');
    }

    let category = new this.serviceCategoryModel({
      name: createServiceCategoryDto.name,
      storeId: store.id,
    });
    category = await category.save();
    return category;
  }

  async findAll(store: Store) {
    const categories = await this.serviceCategoryModel.find({
      storeId: store.id,
      deletedAt: null,
    });

    return categories;
  }

  findOne(id: number) {
    return `This action returns a #${id} serviceCategory`;
  }

  update(id: number, updateServiceCategoryDto: UpdateServiceCategoryDto) {
    return `This action updates a #${id} serviceCategory`;
  }

  async remove(id: string) {
    console.log('delete category', id);
    const result = await this.serviceCategoryModel.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    console.log("res", result);
    return result;
  }
}
