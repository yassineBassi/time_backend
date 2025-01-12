import { Controller, Get } from '@nestjs/common';
import { ParamsService } from './params.service';
import { Response } from 'src/common/response';

@Controller('params')
export class ParamsController {
  constructor(private readonly paramsService: ParamsService) {}

  @Get('app-links')
  async getAppLinks() {
    return Response.success(await this.paramsService.getAppLinks());
  }

  @Get('tva')
  async fetchTva() {
    return Response.success(await this.paramsService.fetchTva());
  }

  @Get('working-days')
  async getDays() {
    return Response.success(await this.paramsService.getWorkingDays());
  }

  @Get('working-times')
  async getTimes() {
    return Response.success(await this.paramsService.getWorkingTimes());
  }
}
