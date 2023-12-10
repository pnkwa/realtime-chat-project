import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../User/user.model";

export const AppDataSource = new DataSource({
	type: "postgres",
	host: "localhost",
	port: 5432,
	username: "postgres",
	password: "1234",
	database: "postgres",
	synchronize: true,
	logging: false,
	entities: [User],
	migrations: [],
	subscribers: [],
});
