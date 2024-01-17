import {
  BadRequestException,
  HttpException,
  Injectable,
  ForbiddenException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { TransactionDto,TransactionTypeEnum } from './dto/transaction.dto';
import { MessagingService } from 'src/messaging/messaging.service';
import { LoggingService } from 'src/logging/logging.service';
import { UserService } from 'src/user/user.service';
import { HelperService } from 'src/helper/helper.service';
import { TtlService } from 'src/ttl/ttl.service';
import { ConfigService } from '@nestjs/config';
import { ConfigcatService } from 'src/configcat/configcat.service';
import { TransactionLogService } from 'src/transaction-log/transaction-log.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios from 'axios';
import { banks } from '../common/keywords/keywords';
import { ServiceUnavailableException } from '@nestjs/common';
import { WalletService } from 'src/wallet/wallet.service';
import moment from "moment"

@Injectable()
export class TransactionService {
  constructor(
    private messagingService: MessagingService,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly loggingService: LoggingService,
    private readonly userService: UserService,
    private readonly helperService: HelperService,
    private readonly ttlService: TtlService,
    private readonly config: ConfigService,
    private readonly walletService: WalletService,
    private readonly configcatService: ConfigcatService,
    private readonly transactionLogService: TransactionLogService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async createTransaction(sender: string, message: string) {
    const responseTime = this.helperService.currentTime();
    let requestedBy;
    let transCod;
    try {
      this.loggingService.log({
        event: 'method_start',
        message: 'creating a transaction',
      });

      const wordCount = message.split(' ').length;
      if (wordCount !== 3)
        throw new BadRequestException('Invalid message format');

      const phoneNumber = sender.replace('+234', '0');
      const transCode = message.split(' ')[1];
      const pin = message.split(' ')[2].replace(/[.,;!?]$/, '');
      const response: any = await this.cacheService.get(transCode.toString());
      if (!response)
        throw new BadRequestException(
          'This transaction does not exist',
        );
        if(transCode != response.transCode)
        throw new BadRequestException(
          'Invalid Transaction',
        );
      const user: any = await this.userService.findByumber(phoneNumber);
      transCod = response.transCode
      requestedBy = `${user.first_name} ${user.last_name}`
      const expirationTime = response.expirationTime;
      if (Date.now() > expirationTime) {
        throw new BadRequestException('Transaction code has expired');
      }

      const wallet = await this.walletService.getWallet(user);
      console.log(wallet);
      
      const completePin = this.helperService.replaceAsterisks(
        response.redactedPassword,
        pin,
      );

      const decryptedPassword = await this.helperService.decrypt(
        user.password,
        user.ivm,
      );

      if (completePin !== decryptedPassword)
        throw new BadRequestException('Credentials not correct');

      if (wallet.balance < response.amount)
        throw new BadRequestException('Insufficient balance');
      let token: string = await this.cacheService.get('token');

      token = await this.helperService.accessToken(token);
      const url = this.config.get('TRANSFER');
      const data = {
        reference: this.helperService.generateTransactionReference(),
        bank_code: response.bankCode,
        account_number: response.creditAccount,
        account_name: response.account_name,
        amount: response.amount,
        narration: `${user.first_name} ${user.last_name}`,
      };
      const transfer = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(transfer.data);
      if (transfer.data.success !== true)
        throw new ServiceUnavailableException('Something went wrong');
      await this.walletService.updateBalance(user, response.amount);
      let transLogData = {
        response_time: responseTime,
        status: transfer.data.status,
        transaction_type: 'Transfer',
        description: `Transfer of ${response.amount} to ${response.account_name} was successful`,
        transaction_code: transCod,
        message,
        requested_by: requestedBy,
      };
      const transactionData = {
        description : `Transfer of ${response.amount} to ${response.account_name} was successful`,
        amount: response.amount,
        transactionType: TransactionTypeEnum.Power,
        transferToNumber: response.creditAccount,
        transferToBank: response.bank,
        wallet : wallet,
        user : user
      }
      await Promise.all([this.transactionLogService.createTranslog(transLogData),
        this.saveTransaction(transactionData)
      ])
       
      return response;
    } catch (error) {
      let transLogData = {
        response_time: responseTime,
        status: 'Fail',
        transaction_type: 'Transfer',
        description: error.message,
        transaction_code: transCod,
        is_request: false,
        message,
        requested_by: requestedBy,
      };
      await this.transactionLogService.createTranslog(transLogData);
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

  async singleTransaction(id: string) {
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
  async smsTransaction(sender: string, message: string) {
    const transCode = this.helperService.generateOTP(4);
    const requestTime = this.helperService.currentTime();
    let requestedBy;
    try {
      this.loggingService.log({
        event: 'method_start',
        message: 'creating a transaction',
      });
      const wordCount = message.split(' ').length;
      if (wordCount !== 4)
        throw new BadRequestException('Invalid message format');
      const phoneNumber = sender.replace('+234', '0');
      const amount = message.split(' ')[1];
      const creditAccount = message.split(' ')[2];
      const bank = message.split(' ')[3].replace(/[.,;!?]$/, '');
      const isUserExist = await this.userService.findByumber(phoneNumber);

      if (!isUserExist)
        throw new BadRequestException(
          'Transaction not completed, please create an account on Payme to continue',
        );
      let token: string = await this.cacheService.get('token');

      token = await this.helperService.accessToken(token);

      const ttl = await this.ttlService.keywordTtl('Register');
      const expireTime = ttl.ttl * 60000;
      const expirationTime = Date.now() + expireTime;
      const url = this.config.get('VALIDATE_NAME');
      const bankCode = banks[bank.toLowerCase()]?.cbn_code;
      if (!bankCode)
        throw new BadRequestException(`The bank:${bank} does not exist `);
      const data = {
        bank_code: bankCode,
        account_number: creditAccount,
      };

      const decryptedPassword = await this.helperService.decrypt(
        isUserExist.password,
        isUserExist.ivm,
      );

      const redactedPassword =
        this.helperService.randomlyRedact(decryptedPassword);
      let response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success == false)
        throw new BadRequestException(
          `Transaction not completed, can not validate account number.`,
        );

      response.data.transCode = transCode;
      response.data.expirationTime = expirationTime;
      response.data.bankCode = bankCode;
      response.data.creditAccount = creditAccount;
      response.data.amount = Number(amount);
      response.data.phoneNumber = phoneNumber;
      response.data.redactedPassword = redactedPassword;
      response.data.bank = bank

      requestedBy = `${isUserExist.first_name} ${isUserExist.last_name}`;

      await this.cacheService.set(transCode.toString(), response.data);
      let transLogData = {
        request_time: requestTime,
        status: 'Success',
        transaction_type: 'Transfer',
        description: 'Request successful',
        transaction_code: response.data.transCode,
        message,
        requested_by: requestedBy,
      };
      await this.transactionLogService.createTranslog(transLogData);
      return response.data;
    } catch (error) {
      let transLogData = {
        request_time: requestTime,
        status: 'Fail',
        transaction_type: 'Transfer',
        description: error.message,
        transaction_code: transCode,
        is_request: true,
        message,
        requested_by: requestedBy,
      };
      await this.transactionLogService.createTranslog(transLogData);
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async saveTransaction(transactionDto :TransactionDto) {
    try {
       
    
      const createdTransaction = this.transactionRepository.create({...transactionDto})
      
     const savedTransaction = await this.transactionRepository.save(createdTransaction)
      return savedTransaction;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async transferWebhook(payload) {
    try {
      this.loggingService.log({
        event: 'method_start',
        message: 'creating a transaction',
      });
      console.log(payload)
      const accountNumber = payload.data.account_number
      const amount = payload.data.amount
      const wallet = await this.walletRepository.findOne({where:{account_number:accountNumber}})
      console.log(amount,accountNumber)
      wallet.balance = Number(wallet.balance) + Number(amount)
      await this.walletRepository.save(wallet)
      const transactionData = {
        description : `${accountNumber} was successfully credited with ${amount}`,
        amount,
        transactionType: TransactionTypeEnum.Credit,
        wallet : wallet,
        user : wallet.user
      }
   const trans =  await  this.saveTransaction(transactionData)
   console.log(wallet.balance)
  //  console.log("trans:",trans)
  //  console.log(wallet)
     return wallet.balance
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async transferHistory(sender: string, message: string) {
    try {
      this.loggingService.log({
        event: 'method_start',
        message: 'getting transaction history',
      });
      const wordCount = message.split(' ').length;
      if (wordCount !== 3)
        throw new BadRequestException('Invalid message format');
      const phoneNumber = sender.replace('+234', '0');
      let start = message.split(' ')[1];
      let end = message.split(' ')[2].replace(/[.,;!?]$/, '');
      const [month1, year1] = start.split('-');
      start = `${year1}-${month1}-01`;
     const startDate = new Date(start)
      const [month2, year2] = end.split('-');
      end = (`${year2}-${month2}-30`)
      const endDate = new Date(end)
      console.log(startDate,endDate)
      const user = await this.userService.findByumber(phoneNumber);
      const page: number = 1
      const pageSize: number = 10

      if (!user)
        throw new BadRequestException(
          'Transaction not completed, please create an account on Payme to continue',
        );   
        const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
        .where('transaction.created_date >= :startDate', { startDate })
        .andWhere('transaction.created_date <= :endDate', { endDate })
        .andWhere('transaction.user.id = :userId', { userId: user.id })
        .orderBy('transaction.created_date', 'DESC'); // Sort by 'created' field in descending order (most recent first)
  
      const offset = (page - 1) * pageSize;
  
      const transactions = await queryBuilder
        .skip(offset)
        .take(pageSize)
        .getMany();
  
       
      
      
      const excludedProperties = ["id", "created_date", "last_modified_date","transactionId"];
      
     
      const filteredData = transactions.map(item => {
         
          const filteredItem = Object.keys(item)
              .filter(key => !excludedProperties.includes(key))
              .reduce((obj, key) => {
                  if (item[key] !== null) {
                      obj[key] = item[key];
                  }
                  return obj;
              }, {});
      
          return filteredItem;
      });
      
      
      
  
      return filteredData
    }


  
   
    catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
  async transferStatus(sender: string, message: string) {
    try {
      this.loggingService.log({
        event: 'method_start',
        message: 'getting transaction status',
      });
      const wordCount = message.split(' ').length;
      if (wordCount !== 2)
        throw new BadRequestException('Invalid message format');
      const phoneNumber = sender.replace('+234', '0');
    let transCode = message.split(' ')[1].replace(/[.,;!?]$/, '');
   const transCod = Number(transCode)
     
      const user = await this.userService.findByumber(phoneNumber);
      if (!user)
        throw new BadRequestException(
          'Transaction not completed, please create an account on Payme to continue',
        );   
       
       const status = await this.transactionLogService.transactionStatus(transCod)

       return status
     
    }


  
   
    catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
  async exitTransaction(sender: string, message: string) {
    const responseTime = this.helperService.currentTime();
    let requestedBy;
    let transCod;
    try {
      this.loggingService.log({
        event: 'method_start',
        message: 'exiting a transaction',
      });
      if (!message.toLowerCase().includes("exit")) {
        throw new BadRequestException('Invalid key word');
      }
      
      const wordCount = message.split(' ').length;
      console.log(wordCount,message)
      if (wordCount !== 2)
        throw new BadRequestException('Invalid message format');

      const phoneNumber = sender.replace('+234', '0');
      const transCode = message.split(' ')[1];
      const response: any = await this.cacheService.get(transCode.toString());
      if (!response)
        throw new BadRequestException(
          'This transaction does not exist',
        );
        if(transCode != response.transCode)
        throw new BadRequestException(
          'Invalid Transaction',
        );
      const user: any = await this.userService.findByumber(phoneNumber);
      transCod = response.transCode
      requestedBy = `${user.first_name} ${user.last_name}`
      const expirationTime = response.expirationTime;
      if (Date.now() > expirationTime) {
        throw new BadRequestException('Transaction code has expired');
      }

      let transLogData = {
        response_time: responseTime,
        status: "Success",
        transaction_type: 'Exit',
        description: `Exited successfully`,
        transaction_code: transCod,
        message,
        requested_by: requestedBy,
      };
     
      await this.transactionLogService.createTranslog(transLogData);
      return 
    } catch (error) {
      let transLogData = {
        response_time: responseTime,
        status: 'Fail',
        transaction_type: 'Exit',
        description: error.message,
        transaction_code: transCod,
        is_request: false,
        message,
        requested_by: requestedBy,
      };
      await this.transactionLogService.createTranslog(transLogData);
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

}
