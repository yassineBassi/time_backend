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
import { I18nService } from 'nestjs-i18n';
import { DashboardFilterQuery } from 'src/common/models/dahsboard-filter-query';
import { Facility } from 'src/mongoose/facility';
import { ParamsService } from '../params/params.service';
import { FirebaseAdminService } from '../firebase-admin/firebase-admin.service';
import { UserType } from 'src/common/models/enums/user-type';
import { NotificationType } from 'src/common/models/enums/notification-type';
import { NotificationReference } from 'src/common/models/enums/notification-reference';
import { Notification } from 'src/mongoose/notification';
import { UpdateDashboardStore } from './dto/dashboard-update-store';
import { ConfigService } from '@nestjs/config';
const moment = require('moment');

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
    @InjectModel('Facility')
    private readonly facilityModel: Model<Facility>,
    private readonly paramsService: ParamsService,
    private readonly i18n: I18nService,
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
    private firebaseAdminService: FirebaseAdminService,
    private readonly configService: ConfigService,
  ) {}

  defaultSelect =
    'picture storeName category workingTimes available reviews facilities geoLocation isVerified lat lng ';
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
    {
      path: 'workingTimes',
    },
  ];
  defaultFilter = {
    status: UserStatus.ENABLED,
    available: true,
    isDemo: false,
    /*subscription: {
      $not: null,
    }*/
  };
  days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  async getSections() {
    return this.storeSectionModel.find({
      visible: true,
    });
  }

  async getCategories(sectionId: string) {
    const categories = await this.storeCategoryModel.find({
      section: sectionId == 'all' ? undefined : sectionId,
      visible: true,
    });

    return categories;
  }

  async saveWorkingDays(request: any, user: Store) {
    const store = await this.storeModel.findById(user.id);

    let workingTime: any = await this.WorkingTimeModel.findOne({
      storeId: store.id,
    });

    if (!workingTime) {
      workingTime = await (
        await this.WorkingTimeModel.create({
          storeId: store.id,
        })
      ).save();
      store.workingTimes = workingTime.id;
      await store.save();
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

  async addFieldsToStores(
    stores: Store[],
    client: Client,
  ): Promise<Promise<Store>[]> {
    return await Promise.all(
      stores.map(async (s: any) => ({
        ...s.toObject(),
        isFavorite: client ? client.favotiteStores.includes(s.id) : false,
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
        isOpen: this.isStoreOpen(s),
        closingTime: await this.getNextClosingDateTime(s),
        openingTime: await this.getNextOpeningDateTime(s),
      })),
    );
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
        .sort({})
        .limit(limit);
    }

    return await this.addFieldsToStores(stores, client);
  }

  async getStoresWithSegments(client: Client) {
    const storesMap = {};

    const limit = 3;

    // last seen stores
    storesMap[this.i18n.translate('messages.last_seen')] =
      await this.addFieldsToStores(
        await this.storeModel
          .find(this.defaultFilter)
          .select(this.defaultSelect)
          .populate(this.defaultPopulate)
          .sort({ createdAt: -1 })
          .limit(limit),
        client,
      );

    // suggested stores
    storesMap[this.i18n.translate('messages.suggested')] =
      await this.addFieldsToStores(
        await this.storeModel
          .find(this.defaultFilter)
          .select(this.defaultSelect)
          .populate(this.defaultPopulate)
          .limit(limit),
        client,
      );

    // most reserved
    storesMap[this.i18n.translate('messages.most_reserved')] =
      await this.addFieldsToStores(
        await this.storeModel
          .find(this.defaultFilter)
          .select(this.defaultSelect)
          .populate(this.defaultPopulate)
          .limit(limit),
        client,
      );

    return storesMap;
  }

  async getMapStores(latitude: string, longitude: string, client: Client) {
    const filter = {
      ...this.defaultFilter,
      geoLocation: {
        $near: {
          $maxDistance: this.configService.get('MAP_RADIUS_KM') * 1000,
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        },
      },
    };

    let stores: any = await this.storeModel
      .find(filter)
      .select(this.defaultSelect)
      .populate(this.defaultPopulate);

    stores = await this.addFieldsToStores(stores, client);

    console.log('stores', stores);

    return stores;
  }

  async getStores(params: any, client: Client) {
    const filter = {
      ...this.defaultFilter,
      country: params['country'],
    };

    if (params['category'] && params['category'] != 'all') {
      filter['category'] = params['category'];
    } else if (params['section'] && params['section'] != 'all') {
      filter['category'] = {
        $in: await this.storeCategoryModel.find({ section: params['section'] }),
      };
    }
    if (params['area'] && params['area'] != 'all') {
      filter['area'] = params['area'];
    }
    if (params['city'] && params['city'] != 'all') {
      filter['city'] = params['city'];
    }

    if (params['search'] && params['search'].length) {
      filter['storeName'] = { $regex: new RegExp(`^${params['search']}`, 'i') };
    }

    const stores = await this.storeModel
      .find(filter)
      .select(this.defaultSelect)
      .populate(this.defaultPopulate);

    return this.addFieldsToStores(stores, client);
  }

  isStoreOpen(store: Store): boolean {
    const currentDate = moment();
    const today = currentDate.format('YYYY-MM-DD');
    const todayName = currentDate.format('dddd').toLowerCase();

    let workingTimes = store.workingTimes[todayName];
    if (workingTimes.length) {
      workingTimes = workingTimes
        .map((time) => moment(`${today} ${time}`, 'YYYY-MM-DD hh:mm A'))
        .sort((a, b) => a - b)
        .filter(
          (time) =>
            currentDate.isAfter(time) &&
            currentDate.diff(time, 'minutes') <= 15,
        );
    }

    return !!workingTimes.length;
  }

  getStoreWorkingTimes(store: Store) {
    const currentDate = moment();
    const today = currentDate.format('YYYY-MM-DD');
    const todayName = currentDate.format('dddd').toLowerCase();
    const workingTimes = store.workingTimes[todayName]
      .map((time: string) => moment(`${today} ${time}`, 'YYYY-MM-DD hh:mm A'))
      .filter((time) => time > currentDate)
      .sort((a, b) => a - b);

    return workingTimes;
  }

  async getParamWorkingTimes(date) {
    const today = date.format('YYYY-MM-DD');
    const workingTimes = (await this.paramsService.getWorkingTimes())
      .map((time) => moment(`${today} ${time}`, 'YYYY-MM-DD hh:mm A'))
      .sort((a, b) => a - b);

    return workingTimes;
  }

  async getNextClosingDateTime(store: Store) {
    const storeWorkingTimes = this.getStoreWorkingTimes(store);
    const paramWorkingTimes = (
      await this.getParamWorkingTimes(moment())
    ).filter((time) => time > moment());

    let closingTime;
    for (const time of paramWorkingTimes) {
      if (!storeWorkingTimes.map((t) => t.valueOf()).includes(time.valueOf())) {
        closingTime = time;
        break;
      }
    }

    return closingTime ? closingTime : null;
  }

  async getNextOpeningDateTime(store: Store) {
    const currentDate = moment();
    const today = currentDate.format('YYYY-MM-DD');
    const todayName = currentDate.format('dddd').toLowerCase();
    const nextWorkingTime = store.workingTimes[todayName]
      .map((time) => moment(`${today} ${time}`, 'YYYY-MM-DD hh:mm A'))
      .filter((time) => time > currentDate);

    console.log('store ', store.storeName, ' date : ', nextWorkingTime[0]);
    return nextWorkingTime[0];
  }

  async getStoreById(id: string, client: Client) {
    let store: any = await this.storeModel
      .findOne({
        ...this.defaultFilter,
        _id: id,
      })
      .select(this.defaultSelect)
      .populate(this.defaultPopulate);

    if (!store) {
      throw new NotFoundException();
    }

    store = (await this.addFieldsToStores([store], client))[0];

    return store;
  }

  async getStoreAvailableTimes(date: string, storeId: string) {
    const day = this.days[new Date(date).getDay()];

    const store = await this.storeModel
      .findById(storeId)
      .select('_id geoLocation lat lng workingTimes')
      .populate('workingTimes');

    const reservedTimes = (
      await Promise.all(
        (
          await this.reservationModel
            .find({
              store: store.id,
              status: ReservationStatus.PAYED,
              $or: [
                {
                  $expr: {
                    $gte: [
                      {
                        $dateToString: {
                          format: '%Y-%m-%d',
                          date: '$reservationStartDate',
                        },
                      },
                      new Date(date).toISOString().split('T')[0],
                    ],
                  },
                },
                {
                  $expr: {
                    $gte: [
                      {
                        $dateToString: {
                          format: '%Y-%m-%d',
                          date: '$reservationEndDate',
                        },
                      },
                      new Date(date).toISOString().split('T')[0],
                    ],
                  },
                },
              ],
            })
            .select('reservationDate reservationStartDate reservationEndDate')
        ).map(async (r) => {
          return (await this.getParamWorkingTimes(moment(r.reservationDate)))
            .filter(
              (time) =>
                time.valueOf() >= r.reservationStartDate.valueOf() &&
                time.valueOf() < r.reservationEndDate.valueOf(),
            )
            .map((time) => {
              const date = time.toDate().toISOString();
              const hours = parseInt(date.split('T')[1].split(':')[0]);
              const minutes = parseInt(date.split('T')[1].split(':')[1]);

              const formattedDate =
                (hours % 12 || 12).toString().padStart(2, '0') +
                ':' +
                minutes.toString().padStart(2, '0') +
                ' ' +
                (hours >= 12 ? 'pm' : 'am');

              return formattedDate;
            });
        }),
      )
    ).reduce((acc, curr) => [...acc, ...curr], []);

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

  async toggleAvailablity(user: Store) {
    const store = await this.storeModel.findById(user.id);
    store.available = !store.available;
    await store.save();

    return {
      available: store.available,
    };
  }

  async fetchAvailability(user: Store) {
    const store = await this.storeModel.findById(user.id);
    return {
      available: store.available,
    };
  }

  // Admin services

  async fetchDashboardStores(query: DashboardFilterQuery, subscribed: boolean) {
    const searchQuery = JSON.parse(decodeURIComponent(query.searchQuery));

    const searchFilter = {};

    if (subscribed)
      searchFilter['subscription'] = {
        $ne: null,
      };
    else
      searchFilter['subscription'] = {
        $eq: null,
      };

    Object.keys(searchQuery).forEach((k) => {
      if (searchQuery[k].length)
        searchFilter[k] = { $regex: new RegExp(`${searchQuery[k]}`, 'i') };
    });

    const stores = await this.storeModel
      .find(searchFilter)
      .select(
        '_id picture storeName phoneNumber email address status fullName createdAt',
      )
      .sort({ createdAt: -1 })
      .skip(query.skip)
      .limit(query.take);

    return {
      subscribedStores: subscribed ? stores : [],
      unsubscribedStores: !subscribed ? stores : [],
      count: await this.storeModel.countDocuments(searchFilter),
    };
  }

  async fetchDashboardStore(storeId: string) {
    console.log('fetch store dashboard');
    const store = await this.storeModel
      .findById(storeId)
      .select(
        '_id storeName commerceNumber commerceNumberExpirationDate accountNumber available status picture fullName country area city email phoneNumber address',
      );

    if (!store) {
      throw new NotFoundException('store.not_found');
    }

    return store;
  }

  async blockStores(ids: string[]) {
    const result = await this.storeModel.updateMany(
      {
        _id: {
          $in: ids,
        },
      },
      {
        status: UserStatus.BLOCKED,
      },
    );

    return result;
  }

  async suspendStores(ids: string[]) {
    const result = await this.storeModel.updateMany(
      {
        _id: {
          $in: ids,
        },
      },
      {
        status: UserStatus.SUSPENDED,
      },
    );

    return result;
  }

  async enableStores(ids: string[]) {
    const stores = await this.storeModel.find({
      _id: {
        $in: ids,
      },
    });

    for (const store of stores) {
      store.status = UserStatus.ENABLED;
      await store.save();

      const notification = await (
        await this.notificationModel.create({
          title: this.i18n.translate('messages.your_account_enabled_title'),
          description: this.i18n.translate(
            'messages.your_account_enabled_description',
          ),
          receiverType: UserType.STORE,
          receiver: store.id,
          type: NotificationType.ENABLE_USER,
          referenceType: NotificationReference.SELF,
        })
      ).save();

      await this.firebaseAdminService.sendNotification(
        store.notificationToken,
        notification,
      );
    }

    return {
      success: true,
    };
  }

  async getFacilities() {
    const facilities = await this.facilityModel.find().populate('items');
    return facilities;
  }

  async updateDashboardStore(request: UpdateDashboardStore) {
    console.log('request ---- ', request);
    const store = await this.storeModel.findById(request.id);
    if (!store) {
      throw new NotFoundException('errors.store_not_found');
    }

    store.commerceNumberExpirationDate = request.commerceNumberExpirationDate;
    store.commerceNumber = request.commerceNumber;
    store.accountNumber = request.accountNumber;

    await store.save();

    return {
      success: true,
    };
  }
}
