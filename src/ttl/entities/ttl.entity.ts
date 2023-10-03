import { keyword } from 'src/common/keywords/keywords';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    BeforeUpdate,
  } from 'typeorm';
  
  @Entity()
  export class Ttl {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'enum', enum: ['Register', 'Confirm']})
    ttl_type: string;
  
    @Column()
    ttl: number;
  
    @Column({ type: 'enum', enum: ['Active', 'Inactive'], default: 'Active' })
    status: string;
  
    @Column({ default: false })
    isDeleted: boolean;
  
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
  