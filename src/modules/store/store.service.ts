import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReservationStatus } from 'src/common/models/enums/reservation-status';
import { StoresListSegment } from 'src/common/models/enums/stores-list-segement';
import { Client } from 'src/mongoose/client';
import { Reservation } from 'src/mongoose/reservation';
import { Store } from 'src/mongoose/store';
import { StoreCategory } from 'src/mongoose/store-category';
import { StoreReview } from 'src/mongoose/store-review';
import { StoreSection } from 'src/mongoose/store-section';
import { WorkingTime } from 'src/mongoose/working-time';
import { RateStoreDTO } from './dto/rate-store.sto';
import { StoreReport } from 'src/mongoose/store-report';
import { UserStatus } from 'src/common/models/enums/user-status';

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
    @InjectModel('Reservation')
    private readonly reservationModel: Model<Reservation>,
    @InjectModel('StoreReview')
    private readonly storeReviewModel: Model<StoreReview>,
    @InjectModel('StoreReport')
    private readonly storeReportModel: Model<StoreReport>,
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
  defaultFilter = {
    status: UserStatus.ENABLED
  };

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
      reviews: s.reviews.length
        ? (
            s.reviews
              .map((v) => v.rate)
              .reduce((acc: number, curr: number) => acc + curr) /
            s.reviews.length
          ).toFixed(1)
        : 0,
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


    const reservedTimes = (
      await this.reservationModel
        .find({
          store: store.id,
          status: ReservationStatus.PAYED,
          $expr: {
            $eq: [
              {
                $dateToString: { format: '%Y-%m-%d', date: '$reservationDate' },
              },
              new Date(date).toISOString().split('T')[0],
            ],
          },
        })
        .select('reservationDate')
    )
      .map((r) => r.reservationDate)
      .map((d) => {
        const date = new Date(d);
        const hours = date.getHours();
        const minutes = date.getMinutes();

        const formattedDate =
          (hours % 12 || 12).toString().padStart(2, '0') +
          ':' +
          minutes.toString().padStart(2, '0') +
          ' ' +
          (hours >= 12 ? 'pm' : 'am');

        return formattedDate;
      });

    const workingTimes = store.workingTimes[day];

    return {
      workingTimes,
      reservedTimes,
    };
  }

  async getStoreComments(storeId: string) {
    const reviews = await this.storeReviewModel
      .find({
        store: storeId,
      })
      .populate({
        path: 'client',
        select: 'fullName picture',
      })
      .sort({
        createdAt: -1,
      });

    return reviews;
  }

  async rateStore(request: RateStoreDTO, storeId: string, client: Client) {
    const store = await this.storeModel.findById(storeId);

    const reservationsCounts = await this.reservationModel.countDocuments({
      store: store.id,
      client: client.id,
      status: ReservationStatus.COMPLETED,
    });

    if (!reservationsCounts) {
      throw new ForbiddenException('messages.forbidden');
    }

    const reviewsCount = await this.storeReviewModel.countDocuments({
      client: client.id,
      store: store.id,
    });

    if (reviewsCount) {
      throw new ForbiddenException('messages.forbidden');
    }

    const review = await (
      await this.storeReviewModel.create({
        rate: request.rate,
        comment: request.message,
        client: client.id,
        store: store.id,
      })
    ).save();

    store.reviews.push(review.id);
    await store.save();

    return {
      success: true,
    };
  }

  async reportStore(message: string, reservationId: string, client: Client) {
    if (!message.length) {
      throw new BadRequestException('');
    }

    const reservation = await this.reservationModel.findById(reservationId);

    if (reservation.status == ReservationStatus.PAYED) {
      throw new ForbiddenException();
    }

    if (reservation.client.toString() != client.id) {
      throw new ForbiddenException('');
    }

    const reportsCounts = await this.storeReportModel.countDocuments({
      reservation: reservation.id,
      client: client.id,
    });

    if (reportsCounts) {
      throw new ForbiddenException('messages.forbidden');
    }

    const store = await this.storeModel.findById(reservation.store);

    const report = await (
      await this.storeReportModel.create({
        message,
        client: client.id,
        reservation: reservation.id,
        store: store.id,
      })
    ).save();

    store.reports.push(report.id);
    await store.save();

    return {
      success: true,
    };
  }
}
