import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { OtpToken } from 'src/mongoose/otp-token';
import { RegisterClientDTO } from './dtos/register-client.dto';
import * as bcrypt from 'bcrypt';
import { RegisterStoreDTO } from './dtos/register-STORE.dto';
import { LoginDTO } from './dtos/login.dto';
import { User } from 'src/mongoose/user';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginWithGoogleDTO } from './dtos/login-with-google.dto';
import { UserStatus } from 'src/common/models/enums/user-status';
import { FirebaseAdminService } from '../firebase-admin/firebase-admin.service';
import { UserType } from 'src/common/models/enums/user-type';
import { SubscriptionService } from '../subscription/subscription.service';
import { LoginWithTwitterDTO } from './dtos/login-with-twitter.dto';
import { LoginWithAppleDTO } from './dtos/login-with-apple.dto';
import { EditClientProfileDTO } from './dtos/edi-client-profile.dto';
import { AdminLoginDTO } from './dtos/admin-login';
import { Admin } from 'src/mongoose/admin';
import { Client, ClientModel } from 'src/mongoose/client';
import { Store, StoreModel } from 'src/mongoose/store';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Client')
    private readonly clientModel: ClientModel,
    @InjectModel('Store')
    private readonly storeModel: StoreModel,
    @InjectModel('Admin')
    private readonly adminModel: Model<Admin>,
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
    const select =
      '_id username fullName storeName storeName email phoneNumber picture isVerified type subscription salt password';

    const store = await this.storeModel
      .findOne({ phoneNumber })
      .select(select)
      .populate({
        path: 'category',
        select: 'name section',
        populate: {
          path: 'section',
          select: 'name',
        },
      });
    if (store) {
      console.log(store);
      return store;
    }

    const client = await this.clientModel
      .findOne({ phoneNumber })
      .select(select);
    return client;
  }

  async findUserByFirebase(filter: {
    firebaseID: string;
    googleID?: string;
    twitterID?: string;
    appleID?: string;
  }) {
    const select =
      '_id username fullName storeName storeName email phoneNumber picture isVerified type subscription';

    const store = await this.storeModel
      .findOne(filter)
      .select(select)
      .populate({
        path: 'category',
        select: 'name section',
        populate: {
          path: 'section',
          select: 'name',
        },
      })
      .exec();
    if (store) {
      return store;
    }

    const client = await this.clientModel.findOne(filter).select(select).exec();
    return client;
  }

  async validate(phoneNumber: string, password: string) {
    const account = await this.findUserByPhoneNumber(phoneNumber);

    if (!account) throw new BadRequestException('errors.bad_credentials');

    /*
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const pwd = bcrypt.hashSync(password, account.salt);
    account.salt = salt;
    account.password = pwd;
    await account.save();

    */
    if (
      account.firebaseID ||
      account.password != bcrypt.hashSync(password, account.salt)
    ) {
      throw new BadRequestException('errors.bad_credentials');
    }

    account.password = null;
    return account;
  }

  async loginAccount(account: User, notificationToken: string) {
    if (!account) {
      throw new NotFoundException('errors.account_not_found');
    }

    // check subscription for stores
    if (account.type == UserType.STORE) {
      let store = await this.storeModel
        .findById(account.id)
        .select(
          '_id username storeName category fullName email phoneNumber picture isVerified type subscription',
        )
        .populate({
          path: 'category',
          select: 'name section',
          populate: {
            path: 'section',
            select: 'name',
          },
        });
      const check =
        await this.subscriptionService.checkStoreSubscription(store);
      if (!check) {
        store.subscription = null;
        store = await store.save();
        account = store;
      }
    }

    //////// set firebase notificatgion token /////////

    if (notificationToken) {
      await (
        account.type == UserType.STORE ? this.storeModel : this.clientModel
      ).updateOne({ _id: account.id }, { notificationToken });
    }

    //////////////////////////////////////////

    const payload = {
      sub: account.id,
      username: account.username,
      type: account.type,
    };

    const res = {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
      }),
      account: account,
    };
    return res;
  }

  async loginWithGoogle(request: LoginWithGoogleDTO) {
    const account: User = await this.findUserByFirebase({
      googleID: request.googleID,
      firebaseID: request.firebaseID,
    });

    return this.loginAccount(account, request.notificationToken);
  }

  async loginWithTwitter(request: LoginWithTwitterDTO) {
    const account: User = await this.findUserByFirebase({
      twitterID: request.twitterID,
      firebaseID: request.firebaseID,
    });

    return this.loginAccount(account, request.notificationToken);
  }

  async loginWithApple(request: LoginWithAppleDTO) {
    const account: User = await this.findUserByFirebase({
      appleID: request.appleID,
      firebaseID: request.firebaseID,
    });

    return this.loginAccount(account, request.notificationToken);
  }

  async login(request: LoginDTO) {
    const account = await this.validate(request.phoneNumber, request.password);
    return this.loginAccount(account, request.notificationToken);
  }


  loginAccountAfterRegister(user: User){
    if (user.firebaseID) {
      if (user.googleID)
        return this.loginWithGoogle({
          firebaseID: user.firebaseID,
          googleID: user.googleID,
          notificationToken: user.notificationToken,
        });
      if (user.appleID)
        return this.loginWithApple({
          firebaseID: user.firebaseID,
          appleID: user.appleID,
          notificationToken: user.notificationToken,
        });
      if (user.twitterID)
        return this.loginWithTwitter({
          firebaseID: user.firebaseID,
          twitterID: user.googleID,
          notificationToken: user.notificationToken,
        });
    }

    return this.login({
      phoneNumber: user.phoneNumber as string,
      password: user.password,
      notificationToken: user.notificationToken,
    });
  }

  async registerClient(registerClientDTO: RegisterClientDTO) {
    let client = new this.clientModel(registerClientDTO);
    if (
      registerClientDTO.firebaseID &&
      (registerClientDTO.googleID ||
        registerClientDTO.twitterID ||
        registerClientDTO.appleID)
    ) {
      const users = await this.firebaseService.getUserByUid(
        registerClientDTO.firebaseID as string,
      );
      if (
        !users ||
        !users.length ||
        !users.filter((p) =>
          [
            registerClientDTO.googleID,
            registerClientDTO.twitterID,
            registerClientDTO.appleID,
          ].includes(p.uid),
        ).length
      ) {
        throw new BadRequestException(this.generateUniqueUsername());
      }
      client.status = UserStatus.UNDER_VERIFICATION;
    } else {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(client.password, salt);
      client.password = hashedPassword;
      client.salt = salt;
    }

    client.username = await this.generateUniqueUsername();
    client.type = UserType.CLIENT;

    if (client.picture == '' || client.picture == null)
      client.picture = 'public/images/clients/default-client.jpeg';

    client = await client.save();

    await new this.OtpTokenModel({
      code: this.generateRandomDigits(5),
      expireDate: new Date(new Date().getTime() + 5 * 60 * 1000),
      user: client.id,
    }).save();

    return this.loginAccountAfterRegister(client);
  }

  async registerStore(registerStoreDTO: RegisterStoreDTO, picture: string) {
    let store = new this.storeModel(registerStoreDTO);

    if (
      registerStoreDTO.firebaseID &&
      (registerStoreDTO.googleID ||
        registerStoreDTO.twitterID ||
        registerStoreDTO.appleID)
    ) {
      const users = await this.firebaseService.getUserByUid(
        registerStoreDTO.firebaseID as string,
      );

      if (
        !users ||
        !users.length ||
        !users.filter((p) =>
          [
            registerStoreDTO.googleID,
            registerStoreDTO.twitterID,
            registerStoreDTO.appleID,
          ].includes(p.uid),
        ).length
      ) {
        throw new BadRequestException(this.generateUniqueUsername());
      }
      store.status = UserStatus.UNDER_VERIFICATION;
    } else if (registerStoreDTO.password) {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(store.password, salt);
      store.password = hashedPassword;
      store.salt = salt;
    } else {
      return 'failed';
    }

    if (picture && picture.length) store.picture = picture;
    store.type = UserType.STORE;
    store.username = store.storeName;

    store.geoLocation.coordinates = [
      parseFloat(registerStoreDTO.lng),
      parseFloat(registerStoreDTO.lat),
    ];

    store = await store.save();

    console.log(store);

    await new this.OtpTokenModel({
      code: this.generateRandomDigits(5),
      expireDate: new Date(new Date().getTime() + 5 * 60 * 1000),
      user: store.id,
    }).save();

    store = await this.storeModel.findById(store.id).populate('category');

    return this.loginAccountAfterRegister(store);
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

  async getProfile(user: any) {
    const select =
      '_id picture email phoneNumber type fullName country city area';
    if (user.type == UserType.STORE) {
      user = await this.storeModel
        .findById(user.id)
        .select(
          select +
            ' storeName subscription category geolocation facilities lat lng ',
        )
        .populate({
          path: 'category',
          select: '_id name section',
          populate: {
            path: 'section',
            select: '_id name',
          },
        });
    } else {
      user = await this.clientModel
        .findById(user.id)
        .select(
          select + ' storeName subscription category geolocation lat lng ',
        );
    }
    console.log(user);
    return user;
  }

  async editStoreProfile(request: any, picture: string, currentUser: Store) {
    if (currentUser.id != request.id) {
      throw new ForbiddenException();
    }

    const facilities = request.facilitiesIds.map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    if (picture && picture.length) request.picture = picture;

    await this.storeModel
      .findByIdAndUpdate(currentUser.id, {
        ...request,
        facilities,
      })
      .exec();

    return await this.getProfile(currentUser);
  }

  async editClientProfile(request: EditClientProfileDTO, currentUser: Client) {
    if (currentUser.id != request.id) {
      throw new ForbiddenException();
    }

    await this.clientModel.findByIdAndUpdate(currentUser.id, request).exec();

    return await this.getProfile(currentUser);
  }

  async validateAdmin(email: string, password: string) {
    const account = await this.adminModel.findOne({ email });

    if (!account) throw new BadRequestException('errors.bad_credentials');

    if (account.password != bcrypt.hashSync(password, account.salt)) {
      throw new BadRequestException('errors.bad_credentials');
    }

    return account;
  }

  async logout(user: any) {
    if (user.type == UserType.STORE) {
      user = await this.storeModel.findById(user.id);
    } else {
      user = await this.clientModel.findById(user.id);
    }

    user.notificationToken = null;
    user.save();

    return {
      success: true,
    };
  }

  async deleteAccount(user: User) {
    let result;
    console.log(this.clientModel);
    if (user.type == UserType.STORE) {
      result = await this.storeModel.delete({ _id: user.id });
    } else {
      result = await this.clientModel.delete({ _id: user.id });
    }

    console.log(result);

    return {
      success: true,
    };
  }

  async loginAdmin(request: AdminLoginDTO) {
    const account = await this.validateAdmin(request.email, request.password);
    return this.loginAccount(account, null);
  }
}
