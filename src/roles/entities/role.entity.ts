import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEmail } from 'class-validator';
import { Permission } from './permission.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('role')
@Unique(['role_name'])
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role_name: string;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ nullable: true })
  created_date: Date;

  @Column({ nullable: true })
  last_modified_date: Date;

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: 'role_permission',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @BeforeInsert()
  async addCreatedate() {
    this.last_modified_date = new Date();
    this.created_date = new Date();
  }

  @BeforeUpdate()
  async addUpdatedate() {
    this.last_modified_date = new Date();
  }
}
