import { TransactionType } from './enums/transaction-type';

export interface Transaction {
  _id: string;
  label: string;
  price: number;
  points: number;
  number: string;
  status?: string;
  type: TransactionType;
  date: Date;
}
