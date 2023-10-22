import {  BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggingService } from 'src/logging/logging.service';
import { Repository } from 'typeorm';
import {
    paginate,
    Pagination,
    IPaginationOptions,
  } from 'nestjs-typeorm-paginate';
import { Ttl } from './entities/ttl.entity';
import { TtlDto } from './dto/ttl.dto';
import { UpdateTtlDto } from './dto/updateTtl.dto';
import { keyword } from 'src/common/keywords/keywords';

@Injectable()
export class TtlService {
    constructor(
        private readonly loggingService: LoggingService,
        @InjectRepository(Ttl)
        private readonly ttlRepository: Repository<Ttl>,
      ) {}
    
      async createttl(
        ttlDto: TtlDto,
      ): Promise<Ttl> {
            try {
                this.loggingService.log({
                    event: 'method_start',
                    message: 'creating a time to leave(ttl)',
                  });
                const ttl = this.ttlRepository.create({
                  ...ttlDto,
                });
                await this.ttlRepository.save(ttl);
                return ttl;
            } catch (error) {
                throw new HttpException(
                    {
                      message: 'Error: ' + error,
                    },
                    HttpStatus.BAD_REQUEST,
                  );
            }
       
      }
    
      async singlettl(id: number):Promise<Ttl> {
        try {
          const ttl = await this.ttlRepository.findOne({
            where: { id },
          });
          if(!ttl) throw new BadRequestException("This ttl does not exist")
          return ttl;
        } catch (error) {
          throw new HttpException(
            {
              message: 'Error: ' + error,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    
      async editttl(id: number,updateTtl:UpdateTtlDto):Promise<Ttl> {
        try {
          const tl = await this.ttlRepository.findOne({
            where: { id,
            isDeleted:false },
          });
          if(!tl) throw new BadRequestException("This ttl does not exist")
    
          let {  ttl_type, ttl, status } = updateTtl
      
    
          if(ttl_type){
            tl.ttl_type = ttl_type
          }
          if(ttl){
            tl.ttl = ttl
          }

          if(status){
            tl.status= status
          }
    
          await this.ttlRepository.save(tl)
    
          return tl;
        } catch (error) {
          throw new HttpException(
            {
              message: 'Error: ' + error,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    
      async deleteTtl(id: number) {
        try {
          const ttl = await this.ttlRepository.findOne({
            where: { id,
            isDeleted:false },
          });
          if(!ttl) throw new BadRequestException("This ttl does not exist")
    
         ttl.isDeleted = true
    
          await this.ttlRepository.save(ttl)
    
          return ttl;
        } catch (error) {
          throw new HttpException(
            {
              message: 'Error: ' + error,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    
      async allTtls(options: IPaginationOptions): Promise<Pagination<Ttl>> {
        try {
          this.loggingService.log({
            event: 'method_start',
            message: 'Getting all ttlss',
          });
    
          const queryBuilder = this.ttlRepository.createQueryBuilder('ttl');
        
         
          queryBuilder.where('ttl.isDeleted = :isDeleted', { isDeleted: false });
      
          const ttl = await paginate<Ttl>(queryBuilder, options);
          return ttl;
        } catch (error) {
          throw new HttpException(
            {
              message: 'Error: ' + error,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    
      async keywordTtl (keyword: string):Promise<Ttl> {
        try {
          const ttl = await this.ttlRepository.findOne({
            where: { ttl_type:keyword,
                isDeleted:false
             },
          });
          if(!ttl) throw new BadRequestException("This ttl does not exist")
          return ttl;
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
