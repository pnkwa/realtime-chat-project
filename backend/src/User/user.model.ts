/* eslint-disable no-mixed-spaces-and-tabs */
// Import necessary decorators from TypeORM
import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity()

@Unique(["username"])

export class User {

    @PrimaryGeneratedColumn()
  	    userId: string;

    @Column()
  	    username: string;

    @Column()
  	    password: string;

    @Column({ nullable: true }) 
  	    profileImage: string;
}
