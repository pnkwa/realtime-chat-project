import { AppDataSource } from "../config/data-source";
import { User } from "./user.model";

const userRepository = AppDataSource.getRepository(User);

export async function getAllUsers(req, res) {
	try {
		console.log("Inserting a new user into the database...");
  
		console.log("Loading users from the database...");
		const users = await userRepository.find({
			select: {
				username: true,
				password: true,
				profileImage: true
			}
		});
		res.json(users);
  
		console.log("Loaded users: ", users);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export async function getUserById(req, res) {
	try {
		const userId: number = parseInt(req.params.id);
	
		if (isNaN(userId)) {
			res.status(400).json({ error: "Invalid user ID" });
			return;
		}
	
		const user = await userRepository.findOneBy(({
			userId: userId,
		}));
	
		if (!user) {
			res.status(404).json({ error: "User not found" });
			return;
		}
	
		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export async function createUser(req, res) {
	try {
		const { username, password } = req.body;
		const profileImage = req.file;
		const filePath = profileImage.filename; 

		const user = new User();
		user.username = username;
		user.password = password;
		user.profileImage = filePath;

		await userRepository.save(user);

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export async function updateUser(req, res) {
	try {
		const userId: number = parseInt(req.params.id);
	
		const { username, password, profileImage } = req.body;
	
		const user = await userRepository.findOneBy( ({
			userId: userId,
		}));
	
		user.username = username;
		user.password = password;
		user.profileImage = profileImage;
	
		await userRepository.save(user);
	
		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export async function deleteUser(req, res) {
	const userId: number = parseInt(req.params.id);

	try {
		const user = await userRepository.findOneBy(({
			userId: userId,
		}));

		if (!user) {
			res.status(404).json({ error: "User not found" });
			return;
		}

		await userRepository.remove(user);

		res.json({ message: "User deleted successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

export async function login(req, res) {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			res.status(400).json({ error: "Username and password are required" });
			return;
		}

		const user = await userRepository.findOneBy({
			username: username,
			password: password
		});

		if (!user) {
			res.status(401).json({ error: "Invalid username or password" });
			return;
		}

		res.json({ msg: "Login successful", user: user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

