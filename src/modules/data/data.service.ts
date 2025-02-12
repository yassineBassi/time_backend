import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataService {
  private dataFilePath;
  private areas: any;

  constructor(private readonly configService: ConfigService) {
    this.dataFilePath = path.join(
      this.configService.get('CITIES_AND_AREAS_FILE_PATH'),
      'areas_and_cities.json',
    );
    this.loadData();
  }

  private loadData() {
    try {
      const fileContent = fs.readFileSync(this.dataFilePath, 'utf8');
      this.areas = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading or parsing data file:', error);
      throw new Error('Could not load data');
    }
  }

  getCountries() {
    return ['المملكة العربية السعودية'];
  }

  async getAreas() {
    return this.areas.regions.map((area) => area.name);
  }

  async getCities(area: string) {
    const region = this.areas.regions.find((r) => r.name === area);
    if (!region) {
      throw new NotFoundException('Region not found');
    }
    return region.cities;
  }
}
