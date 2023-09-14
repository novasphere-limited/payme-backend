import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { localAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

@ApiBearerAuth()
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(localAuthGuard)
  @ApiBody({ type: LoginUserDto })
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }
}
