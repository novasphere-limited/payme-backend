import {
  BadRequestException,
  HttpException,
  Injectable,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { TransactionDto } from './dto/transaction.dto';
import { UUID } from 'crypto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async createTransaction(
    transactionDto: TransactionDto,
    user: any,
  ): Promise<Transaction> {
    try {
      delete user.password;
      const { amount, transactionType, transferToId } = transactionDto;
      const { id } = user;

      const wallet = await this.walletRepository.findOne({
        where: { user },
      });

      if (!wallet) {
        throw new BadRequestException('This wallet does not exist');
      }
      if (wallet.user.id !== id)
        throw new ForbiddenException('You cannot carry out this operation');

      if (wallet.balance < amount)
        throw new BadRequestException('Insufficient balance.');

      if (transactionType === 'Transfer') {
        const walletToCredit = await this.walletRepository.findOneBy({
          id: transferToId,
        });
        if (!walletToCredit) {
          throw new BadRequestException('Receipient wallet does not exist');
        }
        wallet.balance = wallet.balance - amount;

        await this.walletRepository.save(wallet);

        walletToCredit.balance = walletToCredit.balance + amount;
        await this.walletRepository.save(walletToCredit);
        const createdTransaction = this.transactionRepository.create({
          ...transactionDto,
          user,
          wallet,
        });

        const savedTransaction = await this.transactionRepository.save(
          createdTransaction,
        );
        
        return savedTransaction;
      }
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async allTransactions(user: any) {
    try {
      const allTransactions = await this.transactionRepository.find({
        where: { user },
      });
      return allTransactions;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async singleTransaction(id: number) {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { id },
      });
      return transaction;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
