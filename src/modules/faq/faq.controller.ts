import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { DashboardFilterQuery } from 'src/common/models/dahsboard-filter-query';
import { Response } from 'src/common/response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserType } from 'src/common/models/enums/user-type';
import { CreateFAQDTO } from './dto/create-faq.dto';
import { UpdateFAQDTO } from './dto/update-faq.dto';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get('')
  async getAllFAQuestions() {
    return Response.success(await this.faqService.getAllFAQuestions());
  }

  @Get('paginate')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async getFAQuestions(@Query() query: DashboardFilterQuery) {
    return Response.success(await this.faqService.getFAQuestions(query));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async getFAQuestion(@Param('id') id: string) {
    return Response.success(await this.faqService.getFAQuestion(id));
  }

  @Post('')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async storeFAQuestion(@Body() request: CreateFAQDTO) {
    return Response.success(await this.faqService.storeFAQuestion(request));
  }

  @Post('update')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async updateFAQuestion(@Body() request: UpdateFAQDTO) {
    return Response.success(await this.faqService.updateFAQuestion(request));
  }

  @Post('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard(UserType.ADMIN))
  async deleteFAQuestion(@Param('id') id: string) {
    return Response.success(await this.faqService.deleteFAQuestion(id));
  }
}
