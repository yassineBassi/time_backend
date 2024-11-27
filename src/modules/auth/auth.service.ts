import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from 'src/mongoose/client';
import { OtpToken } from 'src/mongoose/otp-token';
import { RegisterClientDTO } from './dtos/register-client.dto';
import * as bcrypt from 'bcrypt';
import { RegisterStoreDTO } from './dtos/register-STORE.dto';
import { Store } from 'src/mongoose/store';
import { LoginDTO } from './dtos/login.dto';
import { User } from 'src/mongoose/user';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginWithGoogleDTO } from './dtos/login-with-google.dto';
import { UserStatus } from 'src/common/models/enums/user-status';
import { FirebaseAdminService } from '../firebase-admin/firebase-admin.service';
import { UserType } from 'src/common/models/enums/user-type';
import { SubscriptionService } from '../subscription/subscription.service';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    @InjectModel('Client')
    private readonly clientModel: Model<Client>,
    @InjectModel('Store')
    private readonly storeModel: Model<Store>,
    @InjectModel('OtpToken')
    private readonly OtpTokenModel: Model<OtpToken>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private readonly firebaseService: FirebaseAdminService,
    private subscriptionService: SubscriptionService,
  ) {}

  generateRandomDigits(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }
  private generateRandomUsername(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }

  async generateUniqueUsername(length: number = 8): Promise<string> {
    let username: string;
    let userExists = true;

    while (userExists) {
      username = this.generateRandomUsername(length);
      const store = await this.storeModel.findOne({ username });
      const client = await this.clientModel.findOne({ username });
      userExists = !!store || !!client; // true if user exists, false otherwise
    }

    return username;
  }

  async findUserByPhoneNumber(phoneNumber: string): Promise<any> {
    const store = await this.storeModel.findOne({ phoneNumber });
    if (store) {
      return store;
    }

    const client = await this.clientModel.findOne({ phoneNumber });
    return client;
  }

  async findUserByGoogle(googleID: string, firebaseID: string): Promise<any> {
    const store = await this.storeModel
      .findOne({ googleID, firebaseID })
      .exec();
    if (store) {
      return store;
    }

    const client = await this.clientModel
      .findOne({ googleID, firebaseID })
      .exec();
    return client;
  }

  async validate(phoneNumber: string, password: string) {
    const account = await this.findUserByPhoneNumber(phoneNumber);

    if (!account) throw new BadRequestException('errors.bad_credentials');

    if (
      !account.firebaseID &&
      account.password != bcrypt.hashSync(password, account.salt)
    ) {
      throw new BadRequestException('errors.bad_credentials');
    }
    return account;
  }

  toAccountObject(accountTemp) {
    const accountTempObj = accountTemp.toObject();
    const { password, salt, googleID, firebaseID, ...account } = accountTempObj;
    return account;
  }

  async loginAccount(account) {
    if (!account) {
      throw new NotFoundException('errors.account_not_found');
    }

    // check subscription for stores
    if (account.type == UserType.STORE) {
      let store = await this.storeModel.findById(account.id);
      const check =
        await this.subscriptionService.checkStoreSubscription(store);
      if (!check) {
        store.subscription = null;
        store = await store.save();
        account = store;
      }
    }
    ///////////////////////////////////////////

    const accountObj = this.toAccountObject(account);

    const payload = {
      sub: accountObj._id,
      username: accountObj.username,
      type: accountObj.type,
    };

    const res = {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
      }),
      account: accountObj,
    };
    return res;
  }

  async loginWithGoogle(request: LoginWithGoogleDTO) {
    const account: User = await this.findUserByGoogle(
      request.googleId,
      request.firebaseId,
    );

    return this.loginAccount(account);
  }

  async login(request: LoginDTO) {
    const account = await this.validate(request.phoneNumber, request.password);
    return this.loginAccount(account);
  }

  async registerClient(registerClientDTO: RegisterClientDTO) {
    let client = new this.clientModel(registerClientDTO);

    if (registerClientDTO.firebaseID && registerClientDTO.googleID) {
      const user = await this.firebaseService.getUserByUid(
        registerClientDTO.firebaseID as string,
      );
      if (!user || user.uid != registerClientDTO.googleID) {
        throw new BadRequestException(this.generateUniqueUsername());
      }
      client.status = UserStatus.VERIFIED;
    } else {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(client.password, salt);
      client.password = hashedPassword;
      client.salt = salt;
    }

    client.username = await this.generateUniqueUsername();
    client.type = UserType.CLIENT;

    client = await client.save();

    await new this.OtpTokenModel({
      code: this.generateRandomDigits(5),
      expireDate: new Date(new Date().getTime() + 5 * 60 * 1000),
      user: client.id,
    }).save();

    return this.login({
      phoneNumber: client.phoneNumber as string,
      password: registerClientDTO.password,
    });
  }

  async registerStore(registerStoreDTO: RegisterStoreDTO, picture: string) {
    let store = new this.storeModel(registerStoreDTO);

    console.log('stooore');
    console.log(store);
    console.log(store.password);

    if (registerStoreDTO.firebaseID && registerStoreDTO.googleID) {
      const user = await this.firebaseService.getUserByUid(
        registerStoreDTO.firebaseID as string,
      );
      if (!user || user.uid != registerStoreDTO.googleID) {
        throw new BadRequestException(this.generateUniqueUsername());
      }
      store.status = UserStatus.VERIFIED;
    } else if (registerStoreDTO.password) {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(store.password, salt);
      store.password = hashedPassword;
      store.salt = salt;
    } else {
      return 'failed';
    }

    store.picture = picture;
    store.type = UserType.STORE;
    store.username = store.storeName;

    store = await store.save();

    await new this.OtpTokenModel({
      code: this.generateRandomDigits(5),
      expireDate: new Date(new Date().getTime() + 5 * 60 * 1000),
      user: store.id,
    }).save();

    store = await this.storeModel.findById(store.id).populate('category');

    return this.login({
      phoneNumber: store.phoneNumber as string,
      password: registerStoreDTO.password,
    });
  }

  sendOTP() {
    return 'terst';
  }

  validateToken(token: string) {
    try {
      const result = this.jwtService.verify(token);
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
