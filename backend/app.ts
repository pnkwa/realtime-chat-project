import express from "express";
import userRoutes from "./src/User/user.controller";
import chatRoutes from "./src/Chat/chat.controller";
import msgRoutes from "./src/Message/message.controller";
import { AppDataSource } from "./src/config/data-source";
import cors from "cors";
const app = express();

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
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});



