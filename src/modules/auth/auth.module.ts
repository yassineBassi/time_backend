import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientSchema } from 'src/mongoose/client';
import { StoreSchema } from 'src/mongoose/store';
import { UserSchema } from 'src/mongoose/user';
import { OtpTokenSchema } from 'src/mongoose/otp-token';
import { IsUniqueConstraint } from 'src/common/validators/is-unique';
import { SharedModule } from 'src/common/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Client', schema: ClientSchema },
      { name: 'Store', schema: StoreSchema },
      { name: 'OtpToken', schema: OtpTokenSchema }
    ]),
    SharedModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
  ],
})
export class AuthModule {}
