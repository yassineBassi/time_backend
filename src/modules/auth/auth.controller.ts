import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'src/common/response';
import { AuthService } from './auth.service';
import { RegisterClientDTO } from './dtos/register-client.dto';
import { RegisterStoreDTO } from './dtos/register-STORE.dto';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import path = require('path');
import { LoginDTO } from './dtos/login.dto';
import { LoginWithGoogleDTO } from './dtos/login-with-google.dto';
import { CurrentUser } from 'src/common/decorators/current-user';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LoginWithTwitterDTO } from './dtos/login-with-twitter.dto';
import { LoginWithAppleDTO } from './dtos/login-with-apple.dto';
import { UserType } from 'src/common/models/enums/user-type';
import { SubscribedStoreGuard } from 'src/common/guards/subscribed-store.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { EditStoreProfileDTO } from './dtos/edit-store-profile.dto';
import { EditClientProfileDTO } from './dtos/edi-client-profile.dto';
import { AdminLoginDTO } from './dtos/admin-login';
import { User } from 'src/mongoose/user';
import { Store } from 'src/mongoose/store';
import { Client } from 'src/mongoose/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() request: LoginDTO) {
    console.log(request);
    return Response.success(await this.authService.login(request), '');
  }

  @Post('login/google')
  async loginWithGoogle(@Body() request: LoginWithGoogleDTO) {
    console.log(request);
    return Response.success(
      await this.authService.loginWithGoogle(request),
      '',
    );
  }

  @Post('login/twitter')
  async loginWithTwitter(@Body() request: LoginWithTwitterDTO) {
    console.log(request);
    return Response.success(
      await this.authService.loginWithTwitter(request),
      '',
    );
  }

  @Post('login/apple')
  async loginWithApple(@Body() request: LoginWithAppleDTO) {
    return Response.success(await this.authService.loginWithApple(request), '');
  }

  @Post('register/client')
  async registerClient(@Body() request: RegisterClientDTO) {
    console.log(request);
    return Response.success(await this.authService.registerClient(request), '');
  }

  @Post('register/store')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './public/images/stores',
        filename: (req, file, cb) => {
          const ext = path.parse(file.originalname).ext;
          cb(null, `store-${uuid()}${ext ? ext : '.png'}`);
        },
      }),
    }),
  )
  async registerStore(
    @Body() request: RegisterStoreDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return Response.success(
      await this.authService.registerStore(
        request,
        files && files.length ? files[0]['path'] : null,
      ),
      '',
    );
  }

  @Post('sendOTP')
  async sendOTP() {
    return Response.success(await this.authService.sendOTP(), '');
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return Response.success(await this.authService.getProfile(user));
  }

  @Post('profile/store')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './public/images/stores',
        filename: (req, file, cb) => {
          const ext = path.parse(file.originalname).ext;
          cb(null, `store-${uuid()}${ext ? ext : '.png'}`);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async editStoreProfile(
    @CurrentUser() currentUser: Store,
    @Body() request: EditStoreProfileDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await Response.success(
      await this.authService.editStoreProfile(
        request,
        files && files.length ? files[0]['path'] : null,
        currentUser,
      ),
    );
  }

  @Post('profile/client')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async editClientProfile(
    @CurrentUser() currentUser: Client,
    @Body() request: EditClientProfileDTO,
  ) {
    return await Response.success(
      await this.authService.editClientProfile(request, currentUser),
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User) {
    return Response.success(await this.authService.logout(user));
  }

  @Post('delete')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@CurrentUser() user: User) {
    return Response.success(await this.authService.deleteAccount(user));
  }

  // dashboard APIs
  @Post('login/admin')
  async loginAdmin(@Body() request: AdminLoginDTO) {
    return Response.success(await this.authService.loginAdmin(request));
  }
}
