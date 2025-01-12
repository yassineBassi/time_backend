import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { populate } from 'dotenv';
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

  defaultSelect =
    'picture storeName category workingTimes available reviews geoLocation isVerified lat lng ';
  defaultPopulate = [
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
  defaultFilter = {};

  async getSections() {
    return this.storeSectionModel.find();
  }

  async getCategories(sectionId: string) {
    const categories = await this.storeCategoryModel.find({
      section: sectionId,
    });

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

  addFieldsToStores(stores: Store[]) {
    return stores.map((s: any) => ({
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
  }

  async getStoresBySegment(segment: StoresListSegment, client: Client) {
    let stores: any = [];

    const limit = 3;

    if (segment == StoresListSegment.NEAR_BY) {
      stores = await this.storeModel
        .find(this.defaultFilter)
        .select(this.defaultSelect)
        .populate(this.defaultPopulate)
        .limit(limit);
    } else if (segment == StoresListSegment.SUGGESTED) {
      stores = await this.storeModel
        .find(this.defaultFilter)
        .select(this.defaultSelect)
        .populate(this.defaultPopulate)
        .limit(limit);
    }

    return this.addFieldsToStores(stores);
  }

  async getMapStores(latitude: string, longitude: string) {
    const filter = {
      ...this.defaultFilter,
      geoLocation: {
        $near: {
          $maxDistance: 5000,
          $geometry: {
            type: 'Point',
            coordinates: [latitude, longitude],
          },
        },
      },
    };

    const stores = await this.storeModel
      .find(filter)
      .select(this.defaultSelect)
      .populate(this.defaultPopulate);

    return this.addFieldsToStores(stores);
  }

  async getStores(params: any) {
    const filter = {
      ...this.defaultFilter,
      category: params['category'],
      country: params['country'],
      area: params['area'],
      city: params['city'],
    };

    const stores = await this.storeModel
      .find(filter)
      .select(this.defaultSelect)
      .populate(this.defaultPopulate);

    return this.addFieldsToStores(stores);
  }

  async getStoreById(id: string) {
    const store = await this.storeModel
      .findOne({
        ...this.defaultFilter,
        _id: id,
      })
      .select(this.defaultSelect)
      .populate(this.defaultPopulate);

    if (!store) {
      throw new NotFoundException();
    }

    return this.addFieldsToStores([store])[0];
  }

  async getStoreAvailableTimes(date: string, storeId: string) {
    storeId = '674fea3538258161503d56f8';
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const day = days[new Date(date).getDay()];

    const store = await this.storeModel
      .findById(storeId)
      .select('_id geoLocation lat lng workingTimes')
      .populate('workingTimes');

    const workingTimes = store.workingTimes[day];

    return {
      workingTimes,
      reservedTimes: workingTimes.slice(0, 3)
    };
  }
}
