import { User } from 'src/user/entities/user.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert,
    BeforeUpdate, OneToOne, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar',  unique: true, generated: 'uuid' })
  transactionId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;


  @Column({ type: 'enum', enum: ['Transfer', 'Bill Payment', 'Others'] }) 
  transactionType: string;

  @Column()
  transferToId: number;

  @Column({ nullable: true })
  created_date: Date;

  @Column({ nullable: true })
  last_modified_date: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet: Wallet;

  @ManyToOne(() => User, (user) => user.wallet)
  user: User;


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
