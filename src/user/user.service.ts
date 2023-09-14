import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { RolePermissionService } from 'src/roles/role-permission.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolePremissionService: RolePermissionService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = { ...createUserDto, is_approved: false, is_deleted: false };
      const createdUser = await this.userRepository.save(
        this.userRepository.create(user),
      );
      delete createdUser.password;
      return createdUser;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error: ' + error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOneBy({
      id,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({
      email,
    });
  }

  async updateUserRole(updateUserRoleDto: UpdateUserRoleDto) {
    const { user_id, role_id } = updateUserRoleDto;

    const userFromDb = await this.findById(user_id);

    if (!userFromDb) {
      throw new HttpException(
        'No user found for specified id.',
        HttpStatus.NOT_FOUND,
      );
    }
    const roleFromDb = await this.rolePremissionService.getRoleById(role_id);

    userFromDb.role = roleFromDb;
    const createdUser = await this.userRepository.save(userFromDb);
    if (createdUser) {
      delete createdUser.password;
      return createdUser;
    }
    throw new HttpException(
      'Unable to update user role.',
      HttpStatus.BAD_REQUEST,
    );
  }
}
