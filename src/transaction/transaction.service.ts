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
import { MessagingService } from 'src/messaging/messaging.service';
import { LoggingService } from 'src/logging/logging.service';

@Injectable()
export class TransactionService {
  constructor(
    private messagingService : MessagingService,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly loggingService: LoggingService
  ) {}

  async createTransaction(
    transactionDto: TransactionDto,
    user: any,
  ): Promise<Transaction> {
    try {
        this.loggingService.log({
            event: 'method_start',
            message: 'creating a transaction',
        });
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
        await Promise.all([
             this.messagingService.sendEmail({email:"eezzy2k3@yahoo.com",subject:"testing",message:"test"}),
             this.messagingService.sendSms("+2348065257619","hello")
        ])
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
  async smsTransaction(sender:string,message:string){
    try {
       const data ={
        sender,
        message
       }
        console.log(data)
        return data
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
