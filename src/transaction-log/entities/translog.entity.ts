
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity()
export class Translog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  request_time: string;

  @Column({ nullable: true })
  response_time: string;

  @Column({ default: true })
  is_request: boolean;

  @Column({type: 'enum', enum: ['Fail', 'Success'] })
  status: string;

  @Column()
  transaction_type: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  requested_by: string;
 
  @Column({nullable:true})
  transaction_code: number;

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
