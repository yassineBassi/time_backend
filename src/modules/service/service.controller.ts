import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Response } from 'src/common/response';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuid } from 'uuid';
import { CurrentUser } from 'src/common/decorators/current-user';
import { Store } from 'src/mongoose/store';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';
import { SubscribedStoreGuard } from 'src/common/guards/subscribed-store.guard';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './public/images/services',
        filename: (req, file, cb) => {
          const ext = path.parse(file.originalname).ext;
          cb(null, `service-${uuid()}${ext ? ext : '.png'}`);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @CurrentUser() store: Store,
  ) {
    return Response.success(
      await this.serviceService.create(
        createServiceDto,
        files[0]['path'],
        store,
      ),
    );
  }

  @Post('update')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './public/images/services',
        filename: (req, file, cb) => {
          const ext = path.parse(file.originalname).ext;
          cb(null, `service-${uuid()}${ext ? ext : '.png'}`);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async update(
    @Body() updateServiceDto: UpdateServiceDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @CurrentUser() store: Store,
  ) {
    return Response.success(
      await this.serviceService.update(
        updateServiceDto,
        files && files.length ? files[0]['path'] : null,
        store,
      ),
    );
  }

  @Post('toggle/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async toggleService(@Param('id') id: string) {
    return Response.success(await this.serviceService.toggleService(id));
  }

  @Post('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async remove(@Param('id') id: string) {
    return Response.success(await this.serviceService.remove(id));
  }

  @Get('byCategoryId')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async fetchByCategoryId(@Query('categoryId') categoryId: string) {
    return Response.success(
      await this.serviceService.fetchByCategoryId(categoryId),
    );
  }

  @Get('facilities')
  //@UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async getFacilities() {
    return Response.success(await this.serviceService.getFacilities());
  }
}
