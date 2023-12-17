/* eslint-disable no-mixed-spaces-and-tabs */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    	chatId: string;
    @Column("text", { array: true })
    	members: string[];
    @CreateDateColumn({type: "timestamp"})
    	timestamps: Date;
}