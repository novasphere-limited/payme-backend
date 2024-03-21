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
    Res,
    Put,
    Delete,
    DefaultValuePipe,
  } from '@nestjs/common';
  import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { BaseResponse } from 'src/common/utils';
  import { localAuthGuard } from 'src/auth/guards/local-auth.guard';
  import { Pagination } from 'nestjs-typeorm-paginate';
import { TransactionLogService } from './transaction-log.service';
import { Translog } from './entities/translog.entity';
 
  ApiBearerAuth();
  @ApiTags('Transaction-Log')
@Controller('transaction-log')
export class TransactionLogController {
    constructor(private readonly transactionLogService:TransactionLogService){}

    @ApiResponse({
        status: 200,
        description: 'Transaction log has successfully been retreived.',
      })
    //   @UseGuards(localAuthGuard)
      @Get(':id')
      async getTransactionLog(
        @Param('id') id: string,
      ): Promise<BaseResponse> {
        const transaction = await this.transactionLogService.singleTranslog(id);
        return {
          message: 'transaction log has successfully been retreived.',
          status: HttpStatus.OK,
          result: transaction,
        };
      }

      @ApiResponse({
        status: 200,
        description: 'All transaction logs has successfully been retreived.',
      })
    //   @UseGuards(localAuthGuard)
      @Get('')
      async getAllNotifications(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 10,
        @Query('status') status: string,
      ): Promise<Pagination<Translog>> {
        limit = limit > 100 ? 100 : limit;
        return this.transactionLogService.alltranslogs({
          page,
          limit,
        },status);
    
        
      }
}



