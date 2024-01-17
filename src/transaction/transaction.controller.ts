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
 
  @Get('sms/confirm-transaction')
  async confirmTransaction(
    @Query("sender") sender: string,
    @Query("message") message:string,
    @Res() res: Response
  ) {
    try {
      const transaction = await this.transactionService.createTransaction(
        sender,message 
      );
      const note = await this.notificationService.keywordNotification("Complete_Transfer")
      note.message = note.message.replace("[amount]", transaction.amount);
      note.message = note.message.replace("[name]", transaction.account_name);
      res.setHeader('Content-Type', 'text/plain')
     return res.send(note.message)
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.send(error.message);
    }
   
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
    @Param('id') id: string,
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
    try {
      const transaction = await this.transactionService.smsTransaction(sender,message );
      const note = await this.notificationService.keywordNotification("Confirm_Transfer")
      note.message = note.message.replace("[amount]", transaction.amount);
      note.message = note.message.replace("[account name]", transaction.account_name);
      note.message = note.message.replace("[Pin]", transaction.redactedPassword);
      note.message = note.message.replace("[transaction code]", transaction.transCode);
      res.setHeader('Content-Type', 'text/plain')
     return res.send(note.message)
      
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.send(error.message);
    }
  
  }

  @ApiResponse({
    status: 201,
    description: 'Update uer wallet from webhook.',
  })
  //   @UseGuards(localAuthGuard)
  @Post('webhook')
  async create(
    @Body() payload
  ) {
    const response = await this.transactionService.transferWebhook(
      payload,
    );
    return {
      message: 'Ttl has successfully been created.',
      status: HttpStatus.CREATED,
      result: response,
    };
  }

  @ApiResponse({
    status: 201,
    description: 'The Transactin has successfully been created.',
  })
 
  @Get('sms-transaction/history')
  async transactionHistory(
    @Query("sender") sender: string,
    @Query("message") message:string,
    @Res() res: Response
  ) {
    try {
      const transaction = await this.transactionService.transferHistory(sender,message );
      if(transaction.length < 1){
        res.setHeader('Content-Type', 'text/plain')
        return res.send("No transaction within this period")
      }
   
    res.setHeader('Content-Type', 'text/plain')
   return res.send(transaction)
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.send(error.message);
    }
    
    
  }

  @Get('sms-transaction/status')
  async transactionStatus(
    @Query("sender") sender: string,
    @Query("message") message:string,
    @Res() res: Response
  ) {
    try {
      const transaction = await this.transactionService.transferStatus(sender,message );
   
    res.setHeader('Content-Type', 'text/plain')
   return res.send(transaction)
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.send(error.message);
    }
    
    
  }


  @ApiResponse({
    status: 200,
    description: 'The Transactin has successfully been cancelled.',
  })
 
  @Get('sms-transaction/exit')
  async exitTransaction(
    @Query("sender") sender: string,
    @Query("message") message:string,
    @Res() res: Response
  ) {

    try {
      const transaction = await this.transactionService.exitTransaction(sender,message );
   
    res.setHeader('Content-Type', 'text/plain')
   return res.send("Transaction cancelled successfully")
    } catch (error) {
      res.setHeader('Content-Type', 'text/plain');
      return res.send(error.message);
    }
    
    
  }
}
