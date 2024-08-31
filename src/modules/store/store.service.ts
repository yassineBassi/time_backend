import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoreCategory } from 'src/mongoose/store-category';
import { StoreSection } from 'src/mongoose/store-section';

@Injectable()
export class StoreService {

    constructor(
        @InjectModel('StoreSection') 
        private readonly storeSectionModel: Model<StoreSection>,
        @InjectModel('StoreCategory') 
        private readonly storeCategoryModel: Model<StoreCategory>,
    ){}

    async getSections(){
        return this.storeSectionModel.find();
    }

    async getCategories(sectionId: String){
        let categories = await this.storeCategoryModel.find({
            section: sectionId
        });

        console.log(sectionId);
        console.log(categories);

        return categories;
    }

}
