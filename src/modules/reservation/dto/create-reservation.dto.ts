import { IsNotEmpty } from 'class-validator';

export class createReservationDTO {
  @IsNotEmpty()
  items: [
    {
      serviceId: string;
      quantity: number;
    },
  ];

  @IsNotEmpty()
  storeId: string;

  @IsNotEmpty()
  tva: number;

  @IsNotEmpty()
  totalPrice: number;

  @IsNotEmpty()
  reservationDate: Date;
}
