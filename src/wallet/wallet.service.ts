import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import {WalletDto} from "./dto/wallet.dto"
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly  walletRepository: Repository<Wallet>
  ) {}

  async createWallet(walletDto :WalletDto): Promise<Wallet> {
    try {
       
    
      const createdWallet = this.walletRepository.create({...walletDto})
      
     const savedWallet = await this.walletRepository.save(createdWallet)
      return savedWallet;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getWallet(user: any):Promise<Wallet> {
    try {
      const retreivedWallet = await this.walletRepository.findOne({where:{user}})
      return retreivedWallet
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateBalance(user: any,amount):Promise<Wallet> {
    try {
      const retreivedWallet = await this.walletRepository.findOne({where:{user}})
      retreivedWallet.balance = retreivedWallet.balance - amount
      await this.walletRepository.save(retreivedWallet)
      return retreivedWallet
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
