import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CurrentUser } from 'src/common/decorators/current-user';
import { Response } from 'src/common/response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/mongoose/user';
import { CreateAppReportDTO } from './dto/create-app-report.dto';


@Controller('report')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('app')
  @UseGuards(JwtAuthGuard)
  async reportApp(
    @Body() request: CreateAppReportDTO,
    @CurrentUser() user: User,
  ) {
    return Response.success(await this.reportsService.reportApp(request, user));
  }
}
