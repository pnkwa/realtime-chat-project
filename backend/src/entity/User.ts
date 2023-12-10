// eslint-disable-next-line no-mixed-spaces-and-tabs
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {

	@PrimaryGeneratedColumn()
		id: number;

	@Column()
		firstName: string;

	@Column()
		lastName: string;

	@Column()
		age: number;

}
