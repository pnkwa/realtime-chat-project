import express from "express";
import testRoutes from "./UserTest/userTest.controller";
import userRoutes from "./User/user.controller";
import { AppDataSource } from "../backend/config/data-source";
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


app.use("/", testRoutes);
app.use("/", userRoutes);
const port = 5001; 
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});



