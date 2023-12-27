import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TransactionTypeEnum {
  Transfer = 'Transfer',
  BillPayment = 'Bill Payment',
  Others = 'Others',
  Credit = "Credit",
  Debit = "Debit",
  Airtime = "Airtime",
  Power = "Power"
}

export class TransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  description: string;


  @ApiProperty()
  @IsNotEmpty()
  transferToNumber?: string;
 
  @ApiProperty()
  @IsNotEmpty()
  transferToBank?: string

 

  @ApiProperty({ enum: TransactionTypeEnum }) 
  @IsNotEmpty()
  transactionType: TransactionTypeEnum; 
}