import { Injectable, HttpException, HttpStatus,BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggingService } from 'src/logging/logging.service';
import { Translog } from './entities/translog.entity';
import { QueryBuilder, Repository } from 'typeorm';
import { TranslogDto } from './dto/translog.dto';
import {
    paginate,
    Pagination,
    IPaginationOptions,
  } from 'nestjs-typeorm-paginate';

@Injectable()
export class TransactionLogService {
    constructor(private readonly loggingService: LoggingService,
        @InjectRepository(Translog)
        private readonly translogRepository: Repository<Translog>,){}

        async createTranslog(
            translogDto: TranslogDto,
          ): Promise<Translog> {
                try {
                    this.loggingService.log({
                        event: 'method_start',
                        message: 'creating a transaction log',
                      });
                    const transLog = this.translogRepository.create({
                      ...translogDto
                    });
                    await this.translogRepository.save(transLog);
                    this.loggingService.log({
                        event: 'method_end',
                        message: 'Transaction log created successfully',
                      });
                    return transLog;
                } catch (error) {
                    throw new HttpException(
                        {
                          message: 'Error: ' + error,
                        },
                        HttpStatus.BAD_REQUEST,
                      );
                }
           
          } 

          async singleTranslog(id: number):Promise<Translog> {
            try {
                this.loggingService.log({
                    event: 'method_start',
                    message: 'retreiving a transaction log',
                  });
              const translog = await this.translogRepository.findOne({
                where: { id },
              });
              if(!translog) throw new BadRequestException("This transaction log does not exist")
              this.loggingService.log({
                event: 'method_end',
                message: 'Transaction log retreived successfully',
              });

              return translog;
            } catch (error) {
              throw new HttpException(
                {
                  message: 'Error: ' + error,
                },
                HttpStatus.BAD_REQUEST,
              );
            }
          }

          async alltranslogs(
            options: IPaginationOptions,
             status: string,
          ): Promise<Pagination<Translog>> {
            try {
              this.loggingService.log({
                event: 'method_start',
                message: 'Getting all transaction logs',
              });
                
              const queryBuilder = this.translogRepository.createQueryBuilder('translog');
            
              if (status) {
                queryBuilder.where('translog.status = :status', { status });
              }
              queryBuilder.orderBy('translog.created_date', 'DESC');
              const translogs = await paginate<Translog>(queryBuilder, options);
              this.loggingService.log({
                event: 'method_end',
                message: 'Transaction logs retreived successfully',
              });
              return translogs;
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
