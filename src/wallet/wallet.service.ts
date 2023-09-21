import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly  walletRepository: Repository<Wallet>
  ) {}

  async createWallet(user:any ): Promise<Wallet> {
    try {
       
        const existingWallet = await this.walletRepository.findOne({
            where: { user}
          });
      if (existingWallet) throw new BadRequestException("User already has a wallet")
      console.log(user)
    
     
      
      delete user.password;
      const createdWallet = this.walletRepository.create({user})
      
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
}
