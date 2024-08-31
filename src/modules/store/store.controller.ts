import { Controller, Get, Param, Query } from '@nestjs/common';
import { Response } from 'src/common/response';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('sections')
  async getSections(){
    return Response.success(await this.storeService.getSections(), "");
  }

  @Get('categories')
  async getCategories(@Query('sectionId') sectionId: String){
    return Response.success(await this.storeService.getCategories(sectionId), "");
  }
}
