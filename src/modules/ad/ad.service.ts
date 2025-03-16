import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ad } from 'src/mongoose/ads';
import { CreateAdDTO } from './dto/create-ad.dto';

@Injectable()
export class AdService {
  constructor(
    @InjectModel('Ad')
    private readonly adModel: Model<Ad>,
  ) {}

  async getAllAds() {
    const ads = await this.adModel.find();
    return {
      ads: ads,
      count: await this.adModel.countDocuments(),
    };
  }

  async createAd(request: CreateAdDTO, image: string) {
    let ad = await this.adModel.create({
      image,
      title: request.title,
    });
    ad = await ad.save();

    return ad;
  }

  async deleteAds(id: string) {
    const result = await this.adModel.deleteOne({
      _id: id,
    });

    return result;
  }
}
