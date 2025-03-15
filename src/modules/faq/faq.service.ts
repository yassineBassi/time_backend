import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DashboardFilterQuery } from 'src/common/models/dahsboard-filter-query';
import { FAQ } from 'src/mongoose/faq';
import { CreateFAQDTO } from './dto/create-faq.dto';
import { UpdateFAQDTO } from './dto/update-faq.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel('FAQ')
    private readonly FAQModel: Model<FAQ>,
    private readonly i18nServoce: I18nService
  ) {}

  async getFAQuestions(query: DashboardFilterQuery) {
    const searchQuery = JSON.parse(decodeURIComponent(query.searchQuery));

    const searchFilter = {};

    Object.keys(searchQuery).forEach((k) => {
      if (searchQuery[k].length)
        searchFilter[k] = { $regex: new RegExp(`${searchQuery[k]}`, 'i') };
    });

    const faqs = await this.FAQModel.find(searchFilter)
      .skip(query.skip)
      .limit(query.take);

    return {
      faqs,
      count: await this.FAQModel.countDocuments(searchFilter),
    };
  }

  async getAllFAQuestions() {
    const faqs = await this.FAQModel.find();
    return faqs;
  }

  async getFAQuestion(id: string) {
    const faq = await this.FAQModel.findById(id);
    return faq;
  }

  async storeFAQuestion(request: CreateFAQDTO) {
    let faq = await this.FAQModel.create({
      question: request.question,
      answer: request.answer,
    });

    faq = await faq.save();

    return faq;
  }

  async updateFAQuestion(request: UpdateFAQDTO) {
    let faq = await this.FAQModel.findById(request._id);

    if (!faq) {
      throw new BadRequestException();
    }

    faq.question = request.question;
    faq.answer = request.answer;

    faq = await faq.save();

    return faq;
  }

  async deleteFAQuestion(id: string) {
    const result = await this.FAQModel.deleteOne({
      _id: id,
    });
    console.log(result);
    return {
      success: true,
      message: this.i18nServoce.translate('messages.faq_delete_message'),
    };
  }
}
