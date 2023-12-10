import express, {Request} from "express";

const router = express.Router();
import { AppDataSource } from "../config/data-source";
import { User } from "./user.model";

//get all users
router.get("/", async (req, res) => {
	try {
		console.log("Inserting a new user into the database...");
  
		console.log("Loading users from the database...");
		const users = await AppDataSource.manager.find(User);
		res.json(users);
  
		console.log("Loaded users: ", users);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});


//get user by id
router.get("/:id", async (req, res) => {
	const userId: number = parseInt(req.params.id);

	if (isNaN(userId)) {
		res.status(400).json({ error: "Invalid user ID" });
		return;
	}

	const user = await AppDataSource.manager.findOneBy(User, {
		id: userId,
	});

	if (!user) {
		res.status(404).json({ error: "User not found" });
		return;
	}

	res.json(user);
});


//create user
router.post("/",async (req, res) => {
	const {
		firstName,
		lastName,
		age,
	} = req.body;

	const user = await new User();
	user.firstName = firstName;
	user.lastName = lastName;
	user.age = age;

	res.json(user);
	await AppDataSource.manager.save(user);
});

router.put("/:id", async (req, res) => {
	const userId: number = parseInt(req.params.id);

	const {
		firstName,
		lastName,
		age,
	} = req.body;

	const user = await AppDataSource.manager.findOneBy(User, {
		id: userId,
	});

	user.firstName = firstName;
	user.lastName = lastName;
	user.age = age;

	res.json(user);
	await AppDataSource.manager.save(user);
});

router.delete("/:id", async (req: Request, res) => {
	const userId: number = parseInt(req.params.id);

	try {
		const user = await AppDataSource.manager.findOneBy(User, {
			id: userId,
		});

		if (!user) {
			res.status(404).json({ error: "User not found" });
			return;
		}

		await AppDataSource.manager.remove(user);

		res.json({ message: "User deleted successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});


export default router;