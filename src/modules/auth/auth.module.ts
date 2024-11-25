import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientSchema } from 'src/mongoose/client';
import { StoreSchema } from 'src/mongoose/store';
import { UserSchema } from 'src/mongoose/user';
import { OtpTokenSchema } from 'src/mongoose/otp-token';
import { SharedModule } from 'src/common/shared.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { FirebaseAdminModule } from '../firebase-admin/firebase-admin.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    SubscriptionModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Client', schema: ClientSchema },
      { name: 'Store', schema: StoreSchema },
      { name: 'OtpToken', schema: OtpTokenSchema },
    ]),
    PassportModule,
    JwtModule.register({
      signOptions: {
        expiresIn: '24h',
        mutatePayload: true,
      },
    }),
    ConfigModule,
    SharedModule,
    FirebaseAdminModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
})
export class AuthModule {}
