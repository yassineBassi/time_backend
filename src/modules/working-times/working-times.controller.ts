import { Controller, Get } from '@nestjs/common';
import { WorkingTimesService } from './working-times.service';
import { Response } from 'src/common/response';

@Controller('working-times')
export class WorkingTimesController {
  constructor(private readonly workingTimesService: WorkingTimesService) {}

  @Get('days')
  async getDays() {
    return Response.success(await this.workingTimesService.getDays());
  }

  @Get('times')
  async getTimes() {
    return Response.success(await this.workingTimesService.getTimes());
  }
}
