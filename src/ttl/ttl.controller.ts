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
import { TtlService } from './ttl.service';
import { BaseResponse } from 'src/common/utils';
import { localAuthGuard } from 'src/auth/guards/local-auth.guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Ttl } from './entities/ttl.entity';
import { TtlDto } from './dto/ttl.dto';
import { UpdateTtlDto } from './dto/updateTtl.dto';

ApiBearerAuth();
@ApiTags('Ttl-Management')
@Controller('ttl')
export class TtlController {
  constructor(private readonly ttlService: TtlService) {}

  @ApiResponse({
    status: 201,
    description: 'The Ttl has successfully been created.',
  })
  //   @UseGuards(localAuthGuard)
  @Post('create-ttl')
  async create(
    @Body() ttlDto: TtlDto,
  ): Promise<BaseResponse> {
    const ttl = await this.ttlService.createttl(
      ttlDto,
    );
    return {
      message: 'Ttl has successfully been created.',
      status: HttpStatus.CREATED,
      result: ttl,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Ttl has successfully been retreived.',
  })
  //   @UseGuards(localAuthGuard)
  @Get(':id')
  async getttl(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BaseResponse> {
    const ttl = await this.ttlService.singlettl(id);
    return {
      message: 'ttl has successfully been retreived.',
      status: HttpStatus.OK,
      result: ttl,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Ttl has successfully been edited.',
  })
  //   @UseGuards(localAuthGuard)
  @Put(':id')
  async editTtl(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTtlDto: UpdateTtlDto,
  ): Promise<BaseResponse> {
    const ttl = await this.ttlService.editttl(
      id,
      updateTtlDto,
    );
    return {
      message: 'Ttl has successfully been edited.',
      status: HttpStatus.OK,
      result: ttl,
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Ttl has successfully been deleted.',
  })
  //   @UseGuards(localAuthGuard)
  @Delete(':id')
  async deleteTtl(@Param('id', ParseIntPipe) id: number) {
    const ttl = await this.ttlService.deleteTtl(id);
    return {
      message: 'ttl has successfully been deleted.',
      status: HttpStatus.OK,
      result: {},
    };
  }

  @ApiResponse({
    status: 200,
    description: 'All ttls has successfully been retreived.',
  })
  @Get('')
  async getAllttlss(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<Ttl>> {
    limit = limit > 100 ? 100 : limit;
    return this.ttlService.allTtls({
      page,
      limit,
    });
  }
}
