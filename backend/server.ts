import express = require("express");
import http = require("http");
import { Application, Request, Response } from "express";
import { Server } from "socket.io";
import * as cors from "cors";

const app: Application = express();

const PORT: number = 8000;

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

io.on("connection", (socket) => {
	console.log("New user connected");

	socket.on("sendMessage", (message) => {
		io.emit("message", message); // Broadcast the message to all connected clients
	});

	socket.on("disconnect", () => {
		console.log("User disconnected");
	});
});

app.get("/", (req: Request, res: Response) => {
	res.send("Express + TypeScript Server");
});

server.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
