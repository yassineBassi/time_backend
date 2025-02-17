import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserType } from 'src/common/models/enums/user-type';
import { Admin } from 'src/mongoose/admin';
import { ClientModel } from 'src/mongoose/client';
import { StoreModel } from 'src/mongoose/store';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel('Store')
    private readonly storeModel: StoreModel,
    @InjectModel('Client')
    private readonly clientModel: ClientModel,
    @InjectModel('Admin')
    private readonly adminModel: Model<Admin>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    let account;

    if (payload.type == UserType.STORE)
      account = await this.storeModel.findById(payload.sub);
    if (payload.type == UserType.CLIENT)
      account = await this.clientModel.findById(payload.sub);
    if (payload.type == UserType.ADMIN)
      account = await this.adminModel.findById(payload.sub);

    return account;
  }
}
