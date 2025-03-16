import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdService } from './ad.service';
import { Response } from 'src/common/response';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import path = require('path');
import { CreateAdDTO } from './dto/create-ad.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';

@Controller('ads')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Get('')
  async getAllAds() {
    return Response.success(await this.adService.getAllAds());
  }

  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './public/images/ads',
        filename: (req, file, cb) => {
          const ext = path.parse(file.originalname).ext;
          cb(null, `ad-${uuid()}${ext ? ext : '.png'}`);
        },
      }),
    }),
  )
  async createAd(
    @Body() request: CreateAdDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return Response.success(
      await this.adService.createAd(
        request,
        files && files.length ? files[0]['path'] : null,
      ),
    );
  }

  @Post('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async deleteAds(@Param('id') id: string) {
    return Response.success(await this.adService.deleteAds(id));
  }
}
