import * as express from "express";

const router = express.Router();
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entity/User";

//get all users
router.get("/", async (req, res) => {
	AppDataSource.initialize().then(async () => {

		console.log("Inserting a new user into the database...");
    
		console.log("Loading users from the database...");
		const users = await AppDataSource.manager.find(User);
		res.json(users);

		console.log("Loaded users: ", users);
    
    
    
	}).catch(error => console.log(error));
});



export default router;