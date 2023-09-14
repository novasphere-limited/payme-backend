import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from 'src/common/utils';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);

    if (!user || !(await comparePassword(password, user.password))) {
      throw new BadRequestException('Invalid Credentials');
    }
    // compare password to hashed passwords
    if (user && (await comparePassword(password, user.password))) {
      // delete password before returning user
      delete user.password;
      return user;
    }
    return null;
  }

  async login(user: User): Promise<{ access_token: string }> {
    delete user.password;
    const payload = {
      sub: user,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
