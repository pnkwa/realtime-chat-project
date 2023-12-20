/* eslint-disable @typescript-eslint/no-var-requires */
import express from "express";
import userRoutes from "./src/User/user.controller";
import chatRoutes from "./src/Chat/chat.controller";
import msgRoutes from "./src/Message/message.controller";
import { AppDataSource } from "./src/config/data-source";
import cors from "cors";
import { Server } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

interface ActiveUser {
  userId: string;
  socketId: string;
}

const app = express();
const httpServer = new Server(app);

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

AppDataSource.initialize()
	.then(() => {
		console.log("Data Source has been initialized!");
	})
	.catch((err) => {
		console.error("Error during Data Source initialization", err);
	});

app.use("/", userRoutes);
app.use("/", chatRoutes);
app.use("/", msgRoutes);

const port = 5001;
const server = httpServer.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

const io = new SocketIOServer(server, {
	cors: {
		origin: "*",
	},
});

let activeUsers: ActiveUser[] = [];

io.on("connection", (socket: Socket) => {
	// Add new User
	socket.on("new-user-add", (newUserId: string) => {
		// If user is not added previously
		if (!activeUsers.some((user) => user.userId === newUserId)) {
			activeUsers.push({
				userId: newUserId,
				socketId: socket.id,
			});
		}
		console.log("Connected Users", activeUsers);
		io.emit("get-users", activeUsers);
	});

	// Send message
	socket.on("send-message", (data) => {
		const { receiverId, chatId, senderId, text } = data as {
			receiverId: string;
			chatId: string;
			senderId: string;
			text: string;
		};

		const user = activeUsers.find((user) => user.userId == receiverId);

		console.log("Sending from socket to : ", receiverId);
		console.log("Data ", { chatId, senderId, text });
		console.log("Socket user ", user);

		if (user) {
			console.log("start receive msg!!");
			io.to(user.socketId).emit("receive-message", {
				chatId,
				senderId,
				text,
				createAt: new Date().toISOString(),
			});
		}
	});

	socket.on("receive-message", (data) => {
		console.log("Received message on server: ", data);
	});

	socket.on("disconnect", () => {
		activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
		io.emit("get-users", activeUsers);
	});
});

export default httpServer;
