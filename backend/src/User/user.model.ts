/* eslint-disable no-mixed-spaces-and-tabs */
// Import necessary decorators from TypeORM
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
  	    userId: number;

    @Column()
  	    username: string;

    @Column()
  	    password: string;

    @Column({ nullable: true }) // Assuming profileImage is optional
  	    profileImage: string;
}
