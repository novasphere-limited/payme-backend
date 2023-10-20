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
import { NotificationService } from 'src/notification/notification.service';

ApiBearerAuth();
@ApiTags('Transactions')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService,
    private readonly notificationService:NotificationService) {}

  @ApiResponse({
    status: 201,
    description: 'The Transactin has successfully been created.',
  })
 
  @Post('sms/confirm-transaction')
  async confirmTransaction(
    @Query("sender") sender: string,
    @Query("message") message:string,
    @Res() res: Response
  ) {
    const transaction = await this.transactionService.createTransaction(
      sender,message 
    );
    const note = await this.notificationService.keywordNotification("Confirm_Transfer")
    // note.message = note.message.replace("[amount]", transaction.amount);
    // note.message = note.message.replace("[account name]", transaction.account_name);
    // note.message = note.message.replace("[Pin]", transaction.redactedPassword);
    // note.message = note.message.replace("[transaction code]", transaction.transCode);
    res.setHeader('Content-Type', 'text/plain')
   return res.send(note.message)
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
 
  @Get('sms-transaction/transfer')
  async smsTransaction(
    @Query("sender") sender: string,
    @Query("message") message:string,
    @Res() res: Response
  ) {
    const transaction = await this.transactionService.smsTransaction(sender,message );
    const note = await this.notificationService.keywordNotification("Confirm_Transfer")
    note.message = note.message.replace("[amount]", transaction.amount);
    note.message = note.message.replace("[account name]", transaction.account_name);
    note.message = note.message.replace("[Pin]", transaction.redactedPassword);
    note.message = note.message.replace("[transaction code]", transaction.transCode);
    res.setHeader('Content-Type', 'text/plain')
   return res.send(note.message)
    
  }

}
