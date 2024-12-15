import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
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

  @Post('register/client')
  async registerAccount(@Body() request: RegisterClientDTO) {
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

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async saveProfile(@CurrentUser() user: any) {
    return Response.success(await this.authService.saveProfile(user));
  }
}
