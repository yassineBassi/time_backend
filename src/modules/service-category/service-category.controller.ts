import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ServiceCategoryService } from './service-category.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { Response } from 'src/common/response';
import { CurrentUser } from 'src/common/decorators/current-user';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';
import { SubscribedStoreGuard } from 'src/common/guards/subscribed-store.guard';
import { Store } from 'src/mongoose/store';

@Controller('service-category')
export class ServiceCategoryController {
  constructor(
    private readonly serviceCategoryService: ServiceCategoryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async create(
    @Body() createServiceCategoryDto: CreateServiceCategoryDto,
    @CurrentUser() store: Store,
  ) {
    return Response.success(
      await this.serviceCategoryService.create(createServiceCategoryDto, store),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.STORE), SubscribedStoreGuard)
  async findAll(@CurrentUser() store: Store) {
    return Response.success(await this.serviceCategoryService.findAll(store));
  }

  @Get('byStoreId')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.CLIENT))
  async fetchByStoreId(@Query('storeId') storeId: string) {
    return Response.success(
      await this.serviceCategoryService.fetchByStoreId(storeId),
    );
  }

  @Post('delete/:id')
  async remove(@Param('id') id: string) {
    return Response.success(await this.serviceCategoryService.remove(id));
  }
}
