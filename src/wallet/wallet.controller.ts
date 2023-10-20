import {
  Controller,
  Body,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { localAuthGuard } from 'src/auth/guards/local-auth.guard';
import { BaseResponse } from 'src/common/utils';
import { WalletDto } from './dto/wallet.dto';

@ApiBearerAuth()
@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @ApiResponse({
    status: 201,
    description: 'The Wallet has successfully been created.',
  })
  // @UseGuards(localAuthGuard)
  @Post('create-wallet')
  async create(@Body() walletDto: WalletDto): Promise<BaseResponse> {
    const wallet = await this.walletService.createWallet(walletDto);
    return {
      message: 'Wallet has successfully been created.',
      status: HttpStatus.CREATED,
      result: wallet,
    };
  }

  @ApiResponse({
    status: 201,
    description: 'The Wallet has successfully been retreived.',
  })
  @UseGuards(localAuthGuard)
  @Get('get-wallet')
  async getWallet(@Request() req: any): Promise<BaseResponse> {
    const wallet = await this.walletService.getWallet(req.user);

    return {
      message: 'Wallet has successfully been retreived.',
      status: HttpStatus.OK,
      result: wallet,
    };
  }
}
