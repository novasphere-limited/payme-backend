import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { RolePermissionService } from 'src/roles/role-permission.service';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { LoggingService } from 'src/logging/logging.service';
import { HelperService } from 'src/helper/helper.service';
import { AxiosResponse, AxiosError } from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import axios from 'axios';
import * as moment from 'moment';
import { TtlService } from 'src/ttl/ttl.service';
import { keyword } from 'src/common/keywords/keywords';
import { TransactionLogService } from 'src/transaction-log/transaction-log.service';
import { constants } from 'fs/promises';
import { WalletService } from 'src/wallet/wallet.service';
import { ConfigcatService } from 'src/configcat/configcat.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolePremissionService: RolePermissionService,
    private readonly loggingService: LoggingService,
    private helperservice: HelperService,
    private readonly httpService: HttpService,
    private readonly helperService: HelperService,
    private readonly ttlService: TtlService,
    private readonly config: ConfigService,
    private readonly configcatService: ConfigcatService,
    private readonly transactionLogService: TransactionLogService,
    private readonly walletService: WalletService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async verifyUser(sender: string, message: string) {
    let transCode;
    const requestTime = this.helperService.currentTime();
    try {
      this.loggingService.log({
        event: 'method_start',
        message: 'Getting user details',
      });
      const wordCount = message.split(' ').length;
      console.log(message)
      if (wordCount !== 2)
        throw new BadRequestException('Invalid message format');
      
      const bvn = message.split(' ')[1].replace(/[.,;!?]$/, '');
      const newPhoneNumber = sender.replace('+234', '0');
      const isExist = await this.findByumber(newPhoneNumber);
      if (isExist) throw new BadRequestException('This user exist');
      let token: string = await this.cacheService.get('token');

      token = await this.helperService.accessToken(token);

      const ttl = await this.ttlService.keywordTtl('Register');
      const expireTime = ttl.ttl * 60000;
      let response;

      const expirationTime = Date.now() + expireTime;

      const url = this.config.get('VERIFICATION_API');

      if(bvn.length !== 11){
        throw new BadRequestException("Invalid BVN number")
      }

      const data = {
        phone: newPhoneNumber,
        bvn
      };
    
      response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    
     
      if (response.data.success === false) {
        throw new BadRequestException('Invalid bvn number');
      }
      transCode = this.helperService.generateOTP(4);
      response = response.data;
      response.data.transCode = transCode;
      response.data.expirationTime = expirationTime;
      if (response.data.enrolment_bank === null) {
        throw new BadRequestException('Invalid bvn number');
      }
      const allowRegIfDiffPhones = await this.configcatService.allowRegIfDiffPhonesFlag()
   
      if(!allowRegIfDiffPhones){
        if (response.data.personal_info.phone_number !== newPhoneNumber) {
          throw new BadRequestException('Bvn does not match phone number');
        }
      }
     

      await this.cacheService.set(newPhoneNumber, response);
      const fullName = response.data.personal_info.full_name;

      const dob = response.data.personal_info.date_of_birth;

      const redactedDate = dob.replace(/^(\d{4})/, '****');
    
      let transLogData = {
        request_time: requestTime,
        status: 'Success',
        transaction_type: 'Registeration',
        description: 'Request successful',
        transaction_code: response.data.transCode,
      };
      await this.transactionLogService.createTranslog(transLogData);
      return { fullName, transCode: response.data.transCode, redactedDate };
    } catch (error) {
      let transLogData = {
        request_time: requestTime,
        status: 'Fail',
        transaction_type: 'Registeration',
        description: error.message,
        transaction_code: transCode,
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

  async create(sender: string, message: string) {
    const responseTime = this.helperService.currentTime();
    let transCod;
    try {
      this.loggingService.log({
        event: 'method_start',
        message: 'creating a user',
      });
      const wordCount = message.split(' ').length;
      if (wordCount !== 4)
        throw new BadRequestException('Invalid message format');
      const newPhoneNumber = sender.replace('+234', '0');
      const responseObj = await this.cacheService.get(newPhoneNumber);
      if(!responseObj) throw new BadRequestException("This user has not been verified.send Register bvn number to 3456")
      const response = responseObj['data'];

      transCod = response.transCode;
      const expirationTime = response.expirationTime;
      // if (Date.now() > expirationTime) {
      //   throw new BadRequestException('Transaction code has expired');
      // }

      const dob = response.personal_info.date_of_birth;
      const userYear = dob.split('-')[0];
      const transCode = message.split(' ')[1];
      const password = message.split(' ')[3].replace(/[.,;!?]$/, '') ;
      const date_of_birth = message.split(' ')[2];
      const birthYear = date_of_birth.split('-')[0];

      const sageSecretKey = await this.configcatService.sageCloudApiSecretKey()

      if(sageSecretKey === "" || sageSecretKey === undefined || sageSecretKey === null) throw new BadRequestException("Something went wrong,try again")


      console.log(transCode, response.transCode);
      if (response.transCode != transCode)
        throw new BadRequestException('wrong transaction code');
      console.log(userYear, birthYear);

      if (userYear !== birthYear)
        throw new BadRequestException('Wrong date of birth');
      const first_name = response.personal_info.first_name;
      const last_name = response.personal_info.last_name;
      const encrypt = await this.helperService.encrypt(password);
    
   
      const userData = {
        first_name: first_name,
        last_name: last_name,
        password: encrypt.encryptedData,
        ivm: encrypt.iv,
        mobile_number: newPhoneNumber,
        date_of_birth: dob,
       
      };
      const user = { ...userData, is_approved: false, is_deleted: false };
      const createdUser = await this.userRepository.save(
        this.userRepository.create(user),
      );
      const url = this.config.get("VIRTUAL_ACCOUNT")
      const data = {
        account_name:response.personal_info.full_name,
        email: `${newPhoneNumber}@yahoo.com`
      }
     const virtualResponse = await axios.post(url, data, {
      headers: {
        Authorization: sageSecretKey
      },
    });
 
    const account_number = virtualResponse.data.data.account_details.account_number
    const bank = virtualResponse.data.data.account_details.bank_name
    const wallet_id = newPhoneNumber.replace(/^0+/, '');
    const walletDto ={
      user:createdUser,
      account_number,
      wallet_id,
      bank
    }
      let transLogData = {
        response_time: responseTime,
        status: 'Success',
        transaction_type: 'Confirm Registeration',
        description: 'Account creation successful',
        transaction_code: response.transCode,
      };
      const [wallet, translog] = await Promise.all([
        this.walletService.createWallet(walletDto),
        this.transactionLogService.createTranslog(transLogData),
       
      ]);
     
      console.log(wallet)
      delete createdUser.password;
      return {createdUser,wallet}
    } catch (error) {
      let transLogData = {
        response_time: responseTime,
        status: 'Fail',
        transaction_type: 'Confirm Registeration',
        description: error.message,
        transaction_code: transCod,
        is_request: false,
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

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({
      id,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({
      email,
    });
  }

  async findByumber(phoneNumber: string): Promise<User | null> {
    return await this.userRepository.findOneBy({
      mobile_number: phoneNumber,
    });
  }

  async updateUserRole(updateUserRoleDto: UpdateUserRoleDto) {
    const { user_id, role_id } = updateUserRoleDto;

    const userFromDb = await this.findById(user_id);

    if (!userFromDb) {
      throw new HttpException(
        'No user found for specified id.',
        HttpStatus.NOT_FOUND,
      );
    }
    const roleFromDb = await this.rolePremissionService.getRoleById(role_id);

    userFromDb.role = roleFromDb;
    const createdUser = await this.userRepository.save(userFromDb);
    if (createdUser) {
      delete createdUser.password;
      return createdUser;
    }
    throw new HttpException(
      'Unable to update user role.',
      HttpStatus.BAD_REQUEST,
    );
  }

  async allUsers(options: IPaginationOptions): Promise<Pagination<User>> {
    try {
      this.loggingService.log({
        event: 'method_start',
        message: 'Getting all users',
      });

      const users = await paginate<User>(this.userRepository, options);

      return users;
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
