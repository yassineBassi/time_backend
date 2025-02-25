import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StoreCategoryService } from './store-category.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';
import { DashboardFilterQuery } from 'src/common/models/dahsboard-filter-query';
import { Response } from 'src/common/response';
import { CreateStoreCategoryDTO } from './dto/create-store-category.dto';
import { UpdateStoreCategoryDTO } from './dto/update-store-category.dto';
import { UpdateStoreSectionDTO } from './dto/update-store-section.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import path = require('path');

@Controller('store-category')
export class StoreCategoryController {
  constructor(private readonly storeCategoryService: StoreCategoryService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async getCategoriesInDashboard(@Query() query: DashboardFilterQuery) {
    return Response.success(
      await this.storeCategoryService.getCategories(query),
    );
  }

  @Get('sections')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async getAllSections() {
    return Response.success(await this.storeCategoryService.getAllSections());
  }

  @Get('sections/paginate')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async getSections(@Query() query: DashboardFilterQuery) {
    return Response.success(await this.storeCategoryService.getSections(query));
  }

  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async createCategory(@Body() request: CreateStoreCategoryDTO) {
    return Response.success(
      await this.storeCategoryService.createCategory(request),
    );
  }

  @Post('update')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async updateCategory(@Body() request: UpdateStoreCategoryDTO) {
    return Response.success(
      await this.storeCategoryService.updateCategory(request),
    );
  }

  @Post('sections')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './public/images/sections',
        filename: (req, file, cb) => {
          const ext = path.parse(file.originalname).ext;
          cb(null, `sextion-${uuid()}${ext ? ext : '.png'}`);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async createSection(
    @Body() request: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const iconPath = files.length ? files[0].path : null;
    return Response.success(
      await this.storeCategoryService.createSection(request, iconPath),
    );
  }

  @Post('sections/update')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './public/images/sections',
        filename: (req, file, cb) => {
          const ext = path.parse(file.originalname).ext;
          cb(null, `sextion-${uuid()}${ext ? ext : '.png'}`);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async updateSection(
    @Body() request: UpdateStoreSectionDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const iconPath = files.length ? files[0].path : null;
    return Response.success(
      await this.storeCategoryService.updateSection(request, iconPath),
    );
  }

  @Post('show/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async showCategory(@Param('id') categoryId: string) {
    return Response.success(
      await this.storeCategoryService.toggleCategoryVisibility(
        categoryId,
        true,
      ),
    );
  }

  @Post('hide/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async hdieCategory(@Param('id') categoryId: string) {
    return Response.success(
      await this.storeCategoryService.toggleCategoryVisibility(
        categoryId,
        false,
      ),
    );
  }

  @Post('section/show/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async showSection(@Param('id') sectionId: string) {
    return Response.success(
      await this.storeCategoryService.toggleSectionVisibility(sectionId, true),
    );
  }

  @Post('section/hide/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async hdieSection(@Param('id') sectionId: string) {
    return Response.success(
      await this.storeCategoryService.toggleSectionVisibility(sectionId, false),
    );
  }

  @Get('sections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async getSectionById(@Param('id') sectionId: string) {
    return Response.success(
      await this.storeCategoryService.getSectionById(sectionId),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async getCategoryById(@Param('id') categoryId: string) {
    return Response.success(
      await this.storeCategoryService.getCategoryById(categoryId),
    );
  }
}
