import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEmail } from 'class-validator';

@Entity('[permission]')
@Unique(['permission_title'])
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  permission_title: string;

  @Column()
  module: string;

  @Column({ nullable: true })
  created_date: Date;

  @Column({ nullable: true })
  last_modified_date: Date;

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
