import {
    BadRequestException,
    HttpException,
    Injectable,
    ForbiddenException,
    HttpStatus,
    Inject,
  } from '@nestjs/common';
  import { Wallet } from 'src/wallet/entities/wallet.entity';
  import { Transaction } from 'src/transaction/entities/transaction.entity';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { User } from 'src/user/entities/user.entity';
  import { TransactionDto,TransactionTypeEnum } from 'src/transaction/dto/transaction.dto';
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
  import { airtime } from 'src/common/keywords/keywords';
  import { ServiceUnavailableException } from '@nestjs/common';
  import { WalletService } from 'src/wallet/wallet.service';
  import { TransactionService } from 'src/transaction/transaction.service';
  import { banks,electricityBillers } from '../common/keywords/keywords';
  

@Injectable()
export class BillService {
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
        private readonly transactionService: TransactionService,
        @Inject(CACHE_MANAGER) private cacheService: Cache,
      ) {}

      async airTimePurchase(sender: string, message: string) {
        const transCode = this.helperService.generateOTP(4);
        const requestTime = this.helperService.currentTime();
        let requestedBy;
        try {
          this.loggingService.log({
            event: 'method_start',
            message: 'creating an air time transaction'

          });
          const wordCount = message.split(' ').length;
          if (wordCount !== 4)
            throw new BadRequestException('Invalid message format');
          const phoneNumber = sender.replace('+234', '0');
          const amount = Number(message.split(' ')[1])
          const creditNumber = message.split(' ')[2];
          let network = message.split(' ')[3].replace(/[.,;!?]$/, '');
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
    
           const confirmNetwork = airtime[network.toLowerCase()]?.network
          if (!confirmNetwork) throw new BadRequestException(`The network:${network} does not exist on payme `);
          const service = airtime[network.toLowerCase()].service;

          if(amount < 50) throw new BadRequestException("Minimum recharge is 50 naira")

          console.log(transCode);
          
   
          const decryptedPassword = await this.helperService.decrypt(
            isUserExist.password,
            isUserExist.ivm,
          );
    
          const redactedPassword =
            this.helperService.randomlyRedact(decryptedPassword);
        
            let response = {} as any
        
    
          response.transCode = transCode;
          response.expirationTime = expirationTime;
          response.creditNumber = creditNumber;
          response.amount = Number(amount);
          response.phoneNumber = phoneNumber;
          response.redactedPassword = redactedPassword;
          response.network = confirmNetwork
          response.service = service
    
          requestedBy = `${isUserExist.first_name} ${isUserExist.last_name}`;
          response.name = requestedBy
    
          await this.cacheService.set(transCode.toString(), response);
          let transLogData = {
            request_time: requestTime,
            status: 'Success',
            transaction_type: 'Airtime',
            description: 'Request successful',
            transaction_code: response.transCode,
            message,
            requested_by: requestedBy,
          };
          await this.transactionLogService.createTranslog(transLogData);
          return response;
      
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

      async confirmAirtimePurchase(sender: string, message: string) {
        const responseTime = this.helperService.currentTime();
        let requestedBy;
        let transCod;
        try {
          this.loggingService.log({
            event: 'method_start',
            message: 'confirming airtime purchase',
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
          const url = this.config.get('AIRTIME');
          const data = {
            reference: this.helperService.generateTransactionReference(),
            network:response.network,
            service:response.service,
            phone:response.creditNumber,
            amount:response.amount
          };
          console.log(data)
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
            status: 'Success',
            transaction_type: 'Transfer',
            description: `${response.creditNumber} was recharged with ${response.network} of ${response.amount}`,
            transaction_code: transCod,
            message,
            requested_by: requestedBy,
          };
          const transactionData = {
            description : `Airtime recharge of ${response.amount} for ${response.creditNumber} was successful`,
            amount: response.amount,
            transactionType: TransactionTypeEnum.Airtime,
            wallet : wallet,
            user : user
          }
          await Promise.all([this.transactionLogService.createTranslog(transLogData),
            this.transactionService.saveTransaction(transactionData)
          ])
           
           console.log(wallet.balance)
          return response
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
    
      async powerTransaction(sender: string, message: string) {
        const transCode = this.helperService.generateOTP(4);
        const requestTime = this.helperService.currentTime();
        let requestedBy;
        try {
          this.loggingService.log({
            event: 'method_start',
            message: 'creating a power transaction',
          });
          const wordCount = message.split(' ').length;
          if (wordCount !== 4)
            throw new BadRequestException('Invalid message format');
          const phoneNumber = sender.replace('+234', '0');
          const amount = message.split(' ')[1];
          const meterNumber = message.split(' ')[2];
          const biller = message.split(' ')[3].replace(/[.,;!?]$/, '');
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
          const url = this.config.get('VALIDATE_POWER');
          const type = electricityBillers[biller.toLowerCase()]?.type;
          const disco = electricityBillers[biller.toLowerCase()]?.disco;
          if (!type)
            throw new BadRequestException(`The biller:${biller} does not exist `);
          const data = {
            type,
            account_number:meterNumber
        }
    
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
              `Transaction not completed, can not validate meter number.`,
            );
           
          response.data.customer.transCode = transCode;
          response.data.customer.expirationTime = expirationTime;
          response.data.customer.type = type;
          response.data.customer.meterNumber = meterNumber
          response.data.customer.amount = amount;
          response.data.customer.phoneNumber = phoneNumber;
          response.data.customer.redactedPassword = redactedPassword;
          response.data.customer.disco = disco;
         
   
          requestedBy = `${isUserExist.first_name} ${isUserExist.last_name}`;
    
          await this.cacheService.set(transCode.toString(), response.data.customer);
          let transLogData = {
            request_time: requestTime,
            status: 'Success',
            transaction_type: 'power',
            description: 'Request successful',
            transaction_code: response.data.transCode,
            message,
            requested_by: requestedBy,
          };
          await this.transactionLogService.createTranslog(transLogData);
          return response.data.customer;
        } catch (error) {
          let transLogData = {
            request_time: requestTime,
            status: 'Fail',
            transaction_type: 'power',
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

      async confirmPowerTransaction(sender: string, message: string) {
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
          const url = this.config.get('PURCHASE_POWER');
          const data = {
            reference: this.helperService.generateTransactionReference(),
            type: response.type,
            disco:response.disco,
            account_number: response.meterNumber,
            phone: response.phoneNumber,
            amount: response.amount,
          };
          const power = await axios.post(url, data, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        
          if (power.data.success !== true)
            throw new ServiceUnavailableException('Something went wrong');
          await this.walletService.updateBalance(user, Number(response.amount));
          let transLogData = {
            response_time: responseTime,
            status: "Success",
            transaction_type: 'Power',
            description: `Purchase of power with meter number${response.meterNumber} of amount ${response.amount} was successful`,
            transaction_code: transCod,
            message,
            requested_by: requestedBy,
          };
          const transactionData = {
            description : `Electricity recharge of ${response.amount} to ${response.customerName} with ${response.meterNumber} was successful`,
            amount: response.amount,
            transactionType: TransactionTypeEnum.Transfer,
            transferToNumber: response.creditAccount,
            transferToBank: response.bank,
            wallet : wallet,
            user : user
          }
          await Promise.all([this.transactionLogService.createTranslog(transLogData),
            this.transactionService.saveTransaction(transactionData)
          ])
           
          return power.data.data;
        } catch (error) {
          let transLogData = {
            response_time: responseTime,
            status: 'Fail',
            transaction_type: 'Power',
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

      async balance(sender: string, message: string) {
        const transCode = this.helperService.generateOTP(4);
        const requestTime = this.helperService.currentTime();
        let requestedBy;
        try {
          this.loggingService.log({
            event: 'method_start',
            message: 'checking balance',
          });
          const wordCount = message.split(' ').length;
          if (wordCount !== 1)
            throw new BadRequestException('Invalid message format');
          const phoneNumber = sender.replace('+234', '0');
        
          const isUserExist = await this.userService.findByumber(phoneNumber);
        
    
          if (!isUserExist)
            throw new BadRequestException(
              'Transaction not completed, please create an account on Payme to continue',
            );
        
    
            const wallet = await this.walletService.getWallet(isUserExist);
    
            const balance = wallet.balance
   
          requestedBy = `${isUserExist.first_name} ${isUserExist.last_name}`;
    
         
          let transLogData = {
            request_time: requestTime,
            status: 'Success',
            transaction_type: 'Balance check',
            description: 'Request successful',
            transaction_code: transCode,
            message,
            requested_by: requestedBy,
          };
          await this.transactionLogService.createTranslog(transLogData);
          return balance
        } catch (error) {
          let transLogData = {
            request_time: requestTime,
            status: 'Fail',
            transaction_type: 'Balance check',
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
}
