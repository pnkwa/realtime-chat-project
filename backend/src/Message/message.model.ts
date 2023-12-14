/* eslint-disable no-mixed-spaces-and-tabs */
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    	msgId: number;
    @Column()
    	chatId: number;
    @Column()
    	text: string;
    @CreateDateColumn({type: "timestamp"})
    	createAt: Date;
    @Column()
    	senderId: number;
}