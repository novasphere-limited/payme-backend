import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Transaction,Wallet])],
  providers: [BillService],
  controllers: [BillController]
})
export class BillModule {}
