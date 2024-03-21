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
  import {Response} from 'express'
  import { NotificationService } from 'src/notification/notification.service';
  import { BillService } from 'src/bill/bill.service';
  
  ApiBearerAuth();
  @ApiTags('Bills')

@Controller('bill')
export class BillController {
    constructor(private readonly billService: BillService,
        private readonly notificationService:NotificationService) {}
    
      @ApiResponse({
        status: 201,
        description: 'The Transactin has successfully been created.',
      })
     
      @Get('sms/bill-airtime')
      async createAirtimePurchase(
        @Query("sender") sender: string,
        @Query("message") message:string,
        @Res() res: Response
      ) {
        try {
          const transaction = await this.billService.airTimePurchase(
            sender,message 
          );
          const note = await this.notificationService.keywordNotification("Confirm_Airtime")
          note.message = note.message.replace("[amount]", transaction.amount);
          note.message = note.message.replace("[name]", transaction.name);
          note.message = note.message.replace("[number]", transaction.creditNumber);
          note.message = note.message.replace("[network]", transaction.network);
          note.message = note.message.replace("[pin]", transaction.redactedPassword);
          note.message = note.message.replace("[transcode]", transaction.transCode);
          res.setHeader('Content-Type', 'text/plain')
         return res.send(note.message)
        } catch (error) {
          res.setHeader('Content-Type', 'text/plain');
          return res.send(error.message);
        }
       
      }

      @ApiResponse({
        status: 201,
        description: 'The Transactin has successfully been created.',
      })
     
      @Get('sms/confirm-airtime')
      async confirmAirtimePurchase(
        @Query("sender") sender: string,
        @Query("message") message:string,
        @Res() res: Response
      ) {
        try {
          const transaction = await this.billService.confirmAirtimePurchase(
            sender,message 
          );
          const note = await this.notificationService.keywordNotification("Complete_Airtime")
          note.message = note.message.replace("[amount]", transaction.amount);
          note.message = note.message.replace("[name]", transaction.name);
          note.message = note.message.replace("[number]", transaction.creditNumber);
          note.message = note.message.replace("[network]", transaction.network);
          res.setHeader('Content-Type', 'text/plain')
         return res.send(note.message)
        } catch (error) {
          res.setHeader('Content-Type', 'text/plain');
          return res.send(error.message);
        }
       
      }

      @Get('sms/bill-power')
      async createPowerPurchase(
        @Query("sender") sender: string,
        @Query("message") message:string,
        @Res() res: Response
      ) {
        try {
          const transaction = await this.billService.powerTransaction(
            sender,message 
          );
          const note = await this.notificationService.keywordNotification("Confirm_Power")
          note.message = note.message.replace("[amount]", transaction.amount);
          note.message = note.message.replace("[meter number]", transaction.meterNumber);
          note.message = note.message.replace("[meter name]", transaction.customerName);
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
        description: 'The Transactin has successfully been created.',
      })
     
      @Get('sms/bill-confirm-power')
      async confirmPowerPurchase(
        @Query("sender") sender: string,
        @Query("message") message:string,
        @Res() res: Response
      ) {
        try {
          const transaction = await this.billService.confirmPowerTransaction(
            sender,message 
          );
          const note = await this.notificationService.keywordNotification("Complete_Power")
          note.message = note.message.replace("[token]", transaction.token);
          note.message = note.message.replace("[unit]", transaction.unit);
          
          res.setHeader('Content-Type', 'text/plain')
         return res.send(note.message)
        } catch (error) {
          res.setHeader('Content-Type', 'text/plain');
      return res.send(error.message);
        }
       
      }

      @ApiResponse({
        status: 200,
        description: 'The Transactin has successfully been created.',
      })
     
      @Get('sms/ballance')
      async checkBalance(
        @Query("sender") sender: string,
        @Query("message") message:string,
        @Res() res: Response
      ) {
        try {
          const transaction = await this.billService.balance(
            sender,message 
          );
          res.setHeader('Content-Type', 'text/plain')
         return res.send(transaction)
        } catch (error) {
          res.setHeader('Content-Type', 'text/plain');
          return res.send(error.message);
        }
       
      }
      
}
