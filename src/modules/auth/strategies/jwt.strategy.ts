import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Store } from 'src/mongoose/store';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Client } from 'src/mongoose/client';
import { UserType } from 'src/common/models/enums/user-type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel('Store')
    private readonly storeModel: Model<Store>,
    @InjectModel('Client')
    private readonly clientModel: Model<Client>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const account =
      payload.type == UserType.STORE
        ? await this.storeModel.findById(payload.sub)
        : await this.clientModel.findById(payload.sub);

    return account;
  }
}
