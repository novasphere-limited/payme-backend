import {
  Controller,
  Body,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  ParseFloatPipe,
  Query,
  Res
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { localAuthGuard } from 'src/auth/guards/local-auth.guard';
import { BaseResponse } from 'src/common/utils';
import { TransactionService } from './transaction.service';
import { TransactionDto } from './dto/transaction.dto';
import {Response} from 'express'

ApiBearerAuth();
@ApiTags('Transactions')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiResponse({
    status: 201,
    description: 'The Transactin has successfully been created.',
  })
  @UseGuards(localAuthGuard)
  @Post('create-transaction')
  async create(
    @Body() transactionDto: TransactionDto,
    @Request() req: any,
  ): Promise<BaseResponse> {
    const transaction = await this.transactionService.createTransaction(
      transactionDto,
      req.user,
    );
    return {
      message: 'Transaction has successfully been created.',
      status: HttpStatus.CREATED,
      result: transaction,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'All Transactions has successfully been retreived.',
  })
  @UseGuards(localAuthGuard)
  @Get('all-transactions')
  async allTransaction(@Request() req: any): Promise<BaseResponse> {
    const transaction = await this.transactionService.allTransactions(req.user);
    return {
      message: 'All Transactions has successfully been retreived.',
      status: HttpStatus.OK,
      result: transaction,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Transaction has successfully been retreived.',
  })
  @UseGuards(localAuthGuard)
  @Get(':id')
  async getTransaction(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BaseResponse> {
    const transaction = await this.transactionService.singleTransaction(id);
    return {
      message: 'Transaction has successfully been retreived.',
      status: HttpStatus.OK,
      result: transaction,
    };
  }

  @ApiResponse({
    status: 201,
    description: 'The Transactin has successfully been created.',
  })
 
  @Get('sms-transaction/test')
  async smsTransaction(
    @Query("sender") sender: string,
    @Query("message") message:string,
    @Res() res: Response
  ) {
    const transaction = await this.transactionService.smsTransaction(sender,message );
    console.log("success");
    res.setHeader('Content-Type', 'text/plain')
   return res.send("success")
    
    // return {
    //   message: 'Transaction has successfully been created.',
    //   status: HttpStatus.CREATED,
    //   result: transaction,
    // };
  }

}
