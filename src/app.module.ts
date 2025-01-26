import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseExceptionFilter } from './common/filters/response-exception.filter';
import { WinstonLogger, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { SharedModule } from './common/shared.module';
import { Client, ClientSchema } from './mongoose/client';
import { SectionModule } from './modules/section/section.module';
import { StoreModule } from './modules/store/store.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DataModule } from './modules/data/data.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { ConfigModule } from '@nestjs/config';
import { ServiceModule } from './modules/service/service.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ServiceCategoryModule } from './modules/service-category/service-category.module';
import { FacilityItemSchema } from './mongoose/facility-item';
import { ParamsModule } from './modules/params/params.module';
import { ReportsModule } from './modules/reports/reports.module';
import { StoreSection, StoreSectionSchema } from './mongoose/store-section';
import { Model } from 'mongoose';
import { Store, StoreSchema } from './mongoose/store';
import { StoreCategory, StoreCategorySchema } from './mongoose/store-category';
import { StoreReview, StoreReviewSchema } from './mongoose/store-review';
import { Service, ServiceSchema } from './mongoose/service';
import {
  ServiceCategory,
  ServiceCategorySchema,
} from './mongoose/service-category';
import { WorkingTime, WorkingTimeSchema } from './mongoose/working-time';
import { ReservationModule } from './modules/reservation/reservation.module';
import { Reservation, ReservationSchema } from './mongoose/reservation';
import { WalletModule } from './modules/wallet/wallet.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { GiftCard, GiftCardSchema } from './mongoose/gift-card';
import { GiftModule } from './modules/gift/gift.module';
import { UserStatus } from './common/models/enums/user-status';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { ClientModule } from './modules/client/client.module';
import { Admin, AdminSchema } from './mongoose/admin';
import * as bcrypt from 'bcrypt';
import { UserType } from './common/models/enums/user-type';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/time-db'),
    MongooseModule.forFeature([
      { name: 'Store', schema: StoreSchema },
      { name: 'StoreSection', schema: StoreSectionSchema },
      { name: 'StoreCategory', schema: StoreCategorySchema },
      { name: 'FacilityItem', schema: FacilityItemSchema },
      { name: 'StoreReview', schema: StoreReviewSchema },
      { name: 'Client', schema: ClientSchema },
      { name: 'Service', schema: ServiceSchema },
      { name: 'ServiceCategory', schema: ServiceCategorySchema },
      { name: 'WorkingTime', schema: WorkingTimeSchema },
      { name: 'Reservation', schema: ReservationSchema },
      { name: 'GiftCard', schema: GiftCardSchema },
      { name: 'Admin', schema: AdminSchema },
    ]),
    I18nModule.forRoot({
      fallbackLanguage: 'ar',
      loaderOptions: {
        path: path.join(__dirname, '..', '/src/i18n/'),
        watch: true,
      },
    }),
    WinstonModule.forRoot({
      format: winston.format.combine(winston.format.simple()),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          dirname: path.join(__dirname, './../logs/'),
          filename: 'wabel.log',
        }),
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    SharedModule,
    SectionModule,
    StoreModule,
    DataModule,
    SubscriptionModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServiceModule,
    PaymentModule,
    ServiceCategoryModule,
    ParamsModule,
    ReportsModule,
    ReservationModule,
    WalletModule,
    CouponModule,
    GiftModule,
    ClientModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ResponseExceptionFilter,
    },
    WinstonLogger,
    {
      provide: APP_INTERCEPTOR,
      useClass: WinstonLogger,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }

  constructor(
    @InjectModel('StoreCategory')
    private storeCategoryModel: Model<StoreCategory>,
    @InjectModel('StoreSection')
    private storeSectionModel: Model<StoreSection>,
    @InjectModel('Store')
    private storeModel: Model<Store>,
    @InjectModel('StoreReview')
    private storeReviewModel: Model<StoreReview>,
    @InjectModel('Client')
    private clientModel: Model<Client>,
    @InjectModel('Service')
    private serviceModel: Model<Service>,
    @InjectModel('ServiceCategory')
    private serviceCategoryModel: Model<ServiceCategory>,
    @InjectModel('WorkingTime')
    private workingTimeModel: Model<WorkingTime>,
    @InjectModel('Reservation')
    private reservationModel: Model<Reservation>,
    @InjectModel('GiftCard')
    private giftCardModel: Model<GiftCard>,
    @InjectModel('Admin')
    private adminModel: Model<Admin>,
  ) {
    setTimeout(async () => {

      /*const stores = await this.storeModel.find({});

      const lats = [
        33.50257139798814, 33.51594429344873, 33.5045942321576,
        33.521525361431095, 33.510684595744266, 33.56966136180068,
        33.535115215193855, 33.52103470860897, 33.53493110196977,
        33.51535705672033, 33.470569018357914, 33.488278206373685,
        33.482329026830925,
      ];

      console.log(lats.length);
      console.log(stores.length);

      let ind = 0;
      stores.forEach(async (s) => {
        console.log('---------------------');
        console.log(s.geoLocation.coordinates)
        if (s.geoLocation.coordinates[1] < 0) {
          ind++;
        }
      });

      console.log();*/
    }, 1000);
  }
}

/*
/public/images/sections/camps.png
/public/images/sections/coffe.png





/public/images/sections/tailor.png

*/
