import {
  Entity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  Column,
  ManyToOne,
  OneToMany,
  Generated
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';

@Entity('wallet')
export class Wallet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  wallet_id: string;

  @Column({ nullable: true })
  bank: string;

  @Column()
  @Generated("uuid")
  wallet_code: string;

  @Column({ nullable: true })
  account_number: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  balance: number;

  @Column({ nullable: true })
  created_date: Date;

  @Column({ nullable: true })
  last_modified_date: Date;

  @ManyToOne(() => User, (user) => user.wallet, { eager: true })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];

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
