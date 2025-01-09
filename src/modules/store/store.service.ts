import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PopulateOptions } from 'mongoose';
import { StoresListSegment } from 'src/common/models/enums/stores-list-segement';
import { UserStatus } from 'src/common/models/enums/user-status';
import { Client } from 'src/mongoose/client';
import { Store } from 'src/mongoose/store';
import { StoreCategory } from 'src/mongoose/store-category';
import { StoreSection } from 'src/mongoose/store-section';
import { WorkingTime } from 'src/mongoose/working-time';

@Injectable()
export class StoreService {
  constructor(
    @InjectModel('Store')
    private readonly storeModel: Model<Store>,
    @InjectModel('StoreSection')
    private readonly storeSectionModel: Model<StoreSection>,
    @InjectModel('StoreCategory')
    private readonly storeCategoryModel: Model<StoreCategory>,
    @InjectModel('WorkingTime')
    private readonly WorkingTimeModel: Model<WorkingTime>,
  ) {}

  async getSections() {
    return this.storeSectionModel.find();
  }

  async getCategories(sectionId: string) {
    const categories = await this.storeCategoryModel.find({
      section: sectionId,
    });

    console.log(sectionId);
    console.log(categories);

    return categories;
  }

  async saveWorkingDays(request: any, store: Store) {
    let workingTime: any = await this.WorkingTimeModel.findOne({
      storeId: store.id,
    });

    if (!workingTime) {
      workingTime = await (
        await this.WorkingTimeModel.create({
          storeId: store.id,
        })
      ).save();
    }

    workingTime.monday = request['monday'];
    workingTime.tuesday = request['tuesday'];
    workingTime.wednesday = request['wednesday'];
    workingTime.thursday = request['thursday'];
    workingTime.friday = request['friday'];
    workingTime.sunday = request['sunday'];
    workingTime.saturday = request['saturday'];

    workingTime = await workingTime.save();

    return workingTime;
  }

  async getWorkingDays(store: Store) {
    let workingTime: any = await this.WorkingTimeModel.findOne({
      storeId: store.id,
    });
    if (!workingTime) {
      workingTime = await new this.WorkingTimeModel({
        storeId: store.id,
      }).save();
    }

    return workingTime;
  }

  async getStoresBySegment(segment: StoresListSegment, client: Client) {

    let stores: any = [];

    const select =
      'picture storeName category workingTimes available reviews isVerified lat lng ';
    const filter = {
      //     status: UserStatus.ENABLED
    };
    const limit = 3;
    const populate: PopulateOptions[] = [
      {
        path: 'category',
        select: '_id name section',
        populate: {
          path: 'section',
          select: '_id name',
        },
      },
      {
        path: 'reviews',
      },
    ];

    if (segment == StoresListSegment.NEAR_BY) {
      stores = await this.storeModel
        .find(filter)
        .select(select)
        .populate(populate)
        .limit(limit);
    } else if (segment == StoresListSegment.SUGGESTED) {
      stores = await this.storeModel
        .find(filter)
        .select(select)
        .populate(populate)
        .limit(limit);
    }

    stores = stores.map((s) => ({
      ...s.toObject(),
      isFavorite: false,
      photos: [s.picture],
      reviews: (
        s.reviews
          .map((v) => v.rate)
          .reduce((acc: number, curr: number) => acc + curr) / s.reviews.length
      ).toFixed(1),
      reviewsCount: s.reviews.length,
    }));

    return stores;
  }
}
