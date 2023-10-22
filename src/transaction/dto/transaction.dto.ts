import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum TransactionTypeEnum {
  Transfer = 'Transfer',
  BillPayment = 'Bill Payment',
  Others = 'Others',
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
  walletId: number;

  @ApiProperty()
  @IsNotEmpty()
  transferToNumber: string;

  @ApiProperty({ enum: TransactionTypeEnum }) 
  @IsNotEmpty()
  transactionType: TransactionTypeEnum; 
}