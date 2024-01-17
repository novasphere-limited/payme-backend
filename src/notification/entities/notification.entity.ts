import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import {notificationType} from "../enum/notificationType"
import {notificationStatus} from "../enum/notificationStatus"

@Entity()
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'enum', enum: notificationType })
  notification_type: string;

  @Column()
  message: string;

  @Column({ type: 'enum', enum: notificationStatus, default: notificationStatus.Active })
  status: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column()
  place_holder_count: number;

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
