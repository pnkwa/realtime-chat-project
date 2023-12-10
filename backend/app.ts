import express from "express";
import userRoutes from "./User/user.controller";
import { AppDataSource } from "../backend/config/data-source";

const app = express();

app.use(express.json());

AppDataSource.initialize()
	.then(() => {
		console.log("Data Source has been initialized!");
	})
	.catch((err) => {
		console.error("Error during Data Source initialization", err);
	});

app.use("/", userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
