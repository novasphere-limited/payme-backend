import {
  BadRequestException,
  HttpException,
  Injectable,
  ForbiddenException,
  HttpStatus,
  Inject
} from '@nestjs/common';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { TransactionDto } from './dto/transaction.dto';
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
import {banks} from "../common/keywords/keywords"
import { ServiceUnavailableException } from '@nestjs/common';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class TransactionService {
  constructor(
    private messagingService : MessagingService,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly loggingService: LoggingService,
    private readonly userService: UserService,
    private readonly helperService: HelperService,
    private readonly ttlService: TtlService,
    private readonly config: ConfigService,
    private readonly walletService:WalletService,
    private readonly configcatService: ConfigcatService,
    private readonly transactionLogService: TransactionLogService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async createTransaction(sender:string,message:string){
    const requestTime = this.helperService.currentTime();
    let requestedBy
    try {
        this.loggingService.log({
            event: 'method_start',
            message: 'creating a transaction',
        });
    
        const wordCount = message.split(' ').length;
        if (wordCount !== 3)
        throw new BadRequestException('Invalid message format');
       
        const phoneNumber = sender.replace('+234', '0');
      const transCode = message.split(" ")[1]
      const pin = message.split(" ")[2].replace(/[.,;!?]$/, '');
      const response:any = await this.cacheService.get(transCode.toString());
      if(!response) throw new BadRequestException("This user has not been verified.send Register bvn number to 3456")
      const user:any = await this.userService.findByumber(phoneNumber);

      

      const expirationTime = response.expirationTime;
      if (Date.now() > expirationTime) {
        throw new BadRequestException('Transaction code has expired');
      }

    
      const wallet = await this.walletService.getWallet(user)
       console.log (wallet)
        // await Promise.all([
        //      this.messagingService.sendEmail({email:"eezzy2k3@yahoo.com",subject:"testing",message:"test"}),
        //      this.messagingService.sendSms("+2348065257619","hello")
        // ])
        const completePin = this.helperService.replaceAsterisks(response. redactedPassword,pin)

        const decryptedPassword = await this.helperService.decrypt(user.password,user.ivm)

        if(completePin !== decryptedPassword) throw new BadRequestException("Credentials not correct")

        if(wallet.balance<response.amount) throw new BadRequestException("Insufficient balance")
        let token: string = await this.cacheService.get('token');

        token = await this.helperService.accessToken(token);
        const url = this.config.get("Transfer")
        const data = {
          
            reference:"RE4356-rf",
              bank_code:response.bankCode,
              account_number:response.creditAccount,
              account_name: response.account_name,
              amount:response.amount,
              narration:`${user.first_name} ${user.last_name}`  
          
        }
        const transfer = await axios.post(url, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
console.log(transfer.data)
        if(transfer.data.success !== true )  throw new ServiceUnavailableException("Something went wrong")
        await this.walletService.updateBalance(user,response.amount)
        return response
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
   const transCode = this.helperService.generateOTP(4);
    const requestTime = this.helperService.currentTime();
    let requestedBy
    try {
      const wordCount = message.split(' ').length;
      if (wordCount !== 4)
      throw new BadRequestException('Invalid message format');
      const phoneNumber = sender.replace('+234', '0');
      const amount = message.split(" ")[1]
      const creditAccount = message.split(" ")[2]
      const bank = message.split(" ")[3].replace(/[.,;!?]$/, '');
      const isUserExist = await this.userService.findByumber(phoneNumber);
      
      if (!isUserExist) throw new BadRequestException('Transaction not completed, please create an account on Payme to continue');
      let token: string = await this.cacheService.get('token');

      token = await this.helperService.accessToken(token);

      const ttl = await this.ttlService.keywordTtl('Register');
      const expireTime = ttl.ttl * 60000;
      const expirationTime = Date.now() + expireTime;
      const url = this.config.get('VALIDATE_NAME');
      const bankCode =banks[bank.toLowerCase()]?.cbn_code
      if(!bankCode) throw new BadRequestException(`The bank:${bank} does not exist `)
      const data = {
        bank_code: bankCode,
        account_number: creditAccount
      };
     
    
    const decryptedPassword = await this.helperService.decrypt(isUserExist.password,isUserExist.ivm)
   
    const redactedPassword = this.helperService.randomlyRedact(decryptedPassword)
     let response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

if(response.data.success == false) throw new BadRequestException(`Transaction not completed, can not validate account number.`)


response.data.transCode = transCode;
response.data.expirationTime = expirationTime;
response.data.bankCode = bankCode
response.data.creditAccount = creditAccount
response.data.amount = amount
response.data.phoneNumber = phoneNumber
response.data.redactedPassword = redactedPassword

requestedBy = `${isUserExist.first_name} ${isUserExist.last_name}`

await this.cacheService.set(transCode.toString(), response.data);
let transLogData = {
  request_time: requestTime,
  status: 'Success',
  transaction_type: 'Transfer',
  description: 'Request successful',
  transaction_code: response.data.transCode,
  message,
  requested_by:requestedBy
};
await this.transactionLogService.createTranslog(transLogData);
return response.data
    } catch (error) {
      let transLogData = {
        response_time: requestTime,
        status: 'Fail',
        transaction_type: 'Transfer',
        description: error.message,
        transaction_code: transCode,
        is_request: false,
        message,
        requested_by:requestedBy
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
