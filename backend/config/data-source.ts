import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../src/User/user.model";
import { Chat } from "../src/Chat/chat.model";
import { Message } from "../src/Message/message.model";

export const AppDataSource = new DataSource({
	type: "postgres",
	host: "localhost",
	port: 5432,
	username: "postgres",
	password: "1234",
	database: "postgres",
	synchronize: true,
	logging: false,
	entities: [User, Chat, Message],
	migrations: [],
	subscribers: [],
});
