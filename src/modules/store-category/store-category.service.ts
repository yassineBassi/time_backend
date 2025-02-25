import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { DashboardFilterQuery } from 'src/common/models/dahsboard-filter-query';
import { StoreCategory } from 'src/mongoose/store-category';
import { StoreSection } from 'src/mongoose/store-section';
import { CreateStoreCategoryDTO } from './dto/create-store-category.dto';
import { UpdateStoreCategoryDTO } from './dto/update-store-category.dto';
import { CreateStoreSectionDTO } from './dto/create+store-section.dto';
import { UpdateStoreSectionDTO } from './dto/update-store-section.dto';

@Injectable()
export class StoreCategoryService {
  constructor(
    @InjectModel('StoreCategory')
    private readonly storeCategoryModel: Model<StoreCategory>,
    @InjectModel('StoreSection')
    private readonly storeSectionModel: Model<StoreSection>,
  ) {}

  async getCategories(query: DashboardFilterQuery) {
    const searchQuery = JSON.parse(decodeURIComponent(query.searchQuery));

    const searchFilter = {};

    Object.keys(searchQuery).forEach((k) => {
      if (searchQuery[k].length)
        searchFilter[k] = { $regex: new RegExp(`${searchQuery[k]}`, 'i') };
    });

    if (searchQuery['section'] && searchQuery['section']['id']) {
      searchFilter['section'] = {
        _id: searchQuery['section']['id'],
      };
    }
    console.log(searchFilter);

    const categories = await this.storeCategoryModel
      .find(searchFilter)
      .populate('section')
      .sort({ createdAt: -1 })
      .skip(query.skip)
      .limit(query.take);

    return {
      categories: categories,
      count: await this.storeCategoryModel.countDocuments(searchFilter),
    };
  }

  async getSections(query: DashboardFilterQuery) {
    const searchQuery = JSON.parse(decodeURIComponent(query.searchQuery));

    const searchFilter = {};

    Object.keys(searchQuery).forEach((k) => {
      if (searchQuery[k].length)
        searchFilter[k] = { $regex: new RegExp(`${searchQuery[k]}`, 'i') };
    });

    const sections = await this.storeSectionModel
      .find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(query.skip)
      .limit(query.take);

    return {
      sections: sections,
      count: await this.storeSectionModel.countDocuments(searchFilter),
    };
  }

  async getAllSections() {
    const sections = await this.storeSectionModel.find();
    return sections;
  }

  async getCategoryById(categoryId: string) {
    const category = await this.storeCategoryModel
      .findById(categoryId)
      .populate('section');

    return category;
  }

  async getSectionById(sectionId: string) {
    const section = await this.storeSectionModel.findById(sectionId);

    return section;
  }

  async createCategory(request: CreateStoreCategoryDTO) {
    const section = await this.storeSectionModel.findById(request.section);

    if (!section) {
      throw new BadRequestException('errors.invalid_section');
    }

    const category = await (
      await this.storeCategoryModel.create({
        name: request.name,
        section: request.section,
      })
    ).save();

    return category;
  }

  async updateCategory(request: UpdateStoreCategoryDTO) {
    const category = await this.storeCategoryModel.findById(request._id);
    const section = await this.storeSectionModel.findById(request.section._id);
    category.name = request.name;
    category.section = section.id;

    await category.save();

    return category;
  }

  async createSection(request: CreateStoreSectionDTO, iconPath: string) {
    const section = await (
      await this.storeSectionModel.create({
        name: request.name,
        icon: iconPath,
      })
    ).save();

    return section;
  }

  async updateSection(request: UpdateStoreSectionDTO, iconPath: string) {
    const section = await this.storeSectionModel.findById(request._id);
    section.name = request.name;

    if (iconPath) section.icon = iconPath;

    await section.save();

    return section;
  }

  async toggleCategoryVisibility(categoryId: string, visible: boolean) {
    const category = await this.storeCategoryModel.findById(categoryId);
    if (!category) {
      throw new BadRequestException('category_not_found');
    }
    category.visible = visible;

    await category.save();

    return {
      success: true,
      message: 'success',
    };
  }

  async toggleSectionVisibility(sectionId: string, visible: boolean) {
    const section = await this.storeSectionModel.findById(sectionId);
    if (!section) {
      throw new BadRequestException('section_not_found');
    }
    section.visible = visible;

    await section.save();

    return {
      success: true,
      message: 'success',
    };
  }
}
