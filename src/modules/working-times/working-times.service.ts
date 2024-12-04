import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkingTimesService {
  async getDays() {
    return [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
  }

  async getTimes() {
    return [
      '08:00 am',
      '08:15 am',
      '08:30 am',
      '08:45 am',
      '09:00 am',
      '09:15 am',
      '09:30 am',
      '09:45 am',
      '10:00 am',
      '10:15 am',
      '10:30 am',
      '10:45 am',
      '11:00 am',
      '11:15 am',
      '11:30 am',
      '11:45 am',
      '12:00 am',
      '12:15 am',
      '12:30 am',
      '12:45 am',
      '01:00 pm',
      '01:15 pm',
      '01:30 pm',
      '01:45 pm',
      '02:00 pm',
      '02:15 pm',
      '02:30 pm',
      '02:45 pm',
      '03:00 pm',
      '03:15 pm',
      '03:30 pm',
      '03:45 pm',
      '04:00 pm',
      '04:15 pm',
      '04:30 pm',
      '04:45 pm',
      '05:00 pm',
      '05:15 pm',
      '05:30 pm',
      '05:45 pm',
      '06:00 pm',
      '06:15 pm',
      '06:30 pm',
      '06:45 pm'
    ];
  }
}
