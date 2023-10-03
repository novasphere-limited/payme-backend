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
    private readonly transactionLogService: TransactionLogService,
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
      const ttl = await this.ttlService.keywordTtl('Register');
      const expireTime = ttl.ttl * 60000;
      let response;

      const expirationTime = Date.now() + expireTime;

      const url = this.config.get("VERIFICATION_API")
      const newPhoneNumber = sender.replace('+234', '0');
      const data = {
        mobile: newPhoneNumber,
        isSubjectConsent: true,
      };
      const apiKey = this.config.get('API');

      await this.cacheService.reset();
      response = await this.cacheService.get(newPhoneNumber);
      if (!response) {
        response = await axios.post(url, data, {
          headers: {
            token: apiKey,
          },
        });
        transCode = this.helperService.generateOTP(4);
        response = response.data;
        response.data.transCode = transCode;
        response.data.expirationTime = expirationTime;
      }
      if (response.data.status === 'not_found') {
        throw new BadRequestException('Please number not registered');
      }

      await this.cacheService.set(newPhoneNumber, response);
      let fullName = response.data.phoneDetails.map(
        (details) => details.fullName,
      );
      fullName = fullName[0];
      let dob = response.data.phoneDetails.map(
        (details) => details.dateOfBirth,
      );
      dob = dob[0];
      const redactedDate = dob.replace(/^(\d{4})/, '****');
      console.log(fullName, response.data.transCode, redactedDate);
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
      console.log(sender, message);
      const newPhoneNumber = sender.replace('+234', '0');
      const responseObj = await this.cacheService.get(newPhoneNumber);
      const response = responseObj['data'];
      transCod = response.transCode;
      const expirationTime = response.expirationTime;
      if (Date.now() > expirationTime) {
        throw new BadRequestException('Transaction code has expired');
      }

      let dob = response.phoneDetails.map((details) => details.dateOfBirth);
      dob = dob[0];
      const userYear = dob.split('-')[0];
      const transCode = message.split(' ')[1];
      const password = message.split(' ')[3];
      const date_of_birth = message.split(' ')[2];
      const birthYear = date_of_birth.split('-')[0];

      console.log(transCode, response.transCode);
      if (response.transCode != transCode)
        throw new BadRequestException('wrong transaction code');
      console.log(userYear, birthYear);

      if (userYear !== birthYear)
        throw new BadRequestException('Wrong date of birth');
      let fullName = response.phoneDetails.map((details) => details.fullName);
      fullName = fullName[0];
      const first_name = fullName.split(' ')[1];
      const last_name = fullName.split(' ')[0];
      const userData = {
        first_name: first_name,
        last_name: last_name,
        password,
        mobile_number: newPhoneNumber,
        date_of_birth: dob,
      };
      const user = { ...userData, is_approved: false, is_deleted: false };
      const createdUser = await this.userRepository.save(
        this.userRepository.create(user),
      );
      let transLogData = {
        response_time: responseTime,
        status: 'Success',
        transaction_type: 'Confirm Registeration',
        description: 'Account creation successful',
        transaction_code: response.transCode,
      };
      await this.transactionLogService.createTranslog(transLogData);
      delete createdUser.password;
      return createdUser;
    } catch (error) {
      let transLogData = {
        response_time: responseTime,
        status: 'Fail',
        transaction_type: 'Confirm Registeration',
        description: error.message,
        transaction_code: transCod,
        is_request: false
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
