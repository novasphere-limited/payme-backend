import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Wallet } from './entities/wallet.entity';



@Module({
  imports: [UserModule,TypeOrmModule.forFeature([Wallet])],
  providers: [WalletService],
  exports: [WalletService],
  controllers: [WalletController]
})
export class WalletModule {}
