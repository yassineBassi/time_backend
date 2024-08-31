import { Controller, Get, Query } from '@nestjs/common';
import { Response } from 'src/common/response';
import { DataService } from './data.service';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get("countries")
  async getCountries(){
    return Response.success(await this.dataService.getCountries(), "");
  }

  @Get("areas")
  async getAreas(@Query("area") country: String){
    return Response.success(await this.dataService.getAreas(), "");
  }

  @Get("cities")
  async getCities(@Query("area") area: String){
    return Response.success(await this.dataService.getCities(area), "");
  }

}
