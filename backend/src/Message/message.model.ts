/* eslint-disable no-mixed-spaces-and-tabs */
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    	msgId: string;

    @Column({ nullable: true }) 
    	chatId: string;

    @Column()
    	text: string;

    @CreateDateColumn({ type: "timestamp" })
    	createAt: Date;

    @Column()
    	senderId: number;

    @Column({ nullable: true })
    	key_video: string;
        
}
