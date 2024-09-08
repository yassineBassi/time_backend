import { Body, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'src/common/response';
import { AuthService } from './auth.service';
import { RegisterClientDTO } from './dtos/register-client.dto';
import { RegisterStoreDTO } from './dtos/register-STORE.dto';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import path = require('path');

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register/client")
  async registerAccount(@Body() request: RegisterClientDTO) {
    console.log(request);
    return Response.success(await this.authService.registerClient(request), "");
  }

  @Post("register/store")
  @UseInterceptors(AnyFilesInterceptor({
    storage: diskStorage({
        destination: './public/images/stores',
        filename: (req, file, cb) => {
            const ext = path.parse(file.originalname).ext;
            cb(null, `store-${uuid()}${ext ? ext : '.png'}`)
        },
    })
}))
  async registerStore(
    @Body() request: RegisterStoreDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return Response.success(await this.authService.registerStore(request, files[0]["path"]), "");
  }

}
