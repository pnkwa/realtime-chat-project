import express from "express";
import multer from "multer";
const router = express.Router();
import { AppDataSource } from "../config/data-source";
import { User } from "./user.model";

//get all users
router.get("/user/myprofile", async (req, res) => {
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
router.get("/user/myprofile:id", async (req, res) => {
	try {
		const userId: number = parseInt(req.params.id);
	
		if (isNaN(userId)) {
			res.status(400).json({ error: "Invalid user ID" });
			return;
		}
	
		const user = await AppDataSource.manager.findOneBy(User, {
			userId: userId,
		});
	
		if (!user) {
			res.status(404).json({ error: "User not found" });
			return;
		}
	
		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});


const imageFilter = (req, file, cb) => {
	if (file.mimetype.startsWith("image")) {
		cb(null, true);
	} else {
		cb("Please upload only images", false);
	}
};

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/Images");
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-image-${file.originalname}`);
	},
});

const uploadfile = multer({ storage: storage, fileFilter: imageFilter });

//create user
router.post("/user/myprofile", uploadfile.single("file"), async (req, res) => {
	try {
		const { username, password } = req.body;
		const profileImage = req.file;
		const filePath = profileImage.filename; 

		const user = new User();
		user.username = username;
		user.password = password;
		user.profileImage = filePath;

		console.log("test: post req "+profileImage);

		await AppDataSource.manager.save(user);

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

//update
router.put("/user/myprofile:id", async (req, res) => {
	try {
		const userId: number = parseInt(req.params.id);
	
		const { username, password, profileImage } = req.body;
	
		const user = await AppDataSource.manager.findOneBy(User, {
			userId: userId,
		});
	
		user.username = username;
		user.password = password;
		user.profileImage = profileImage;
	
		await AppDataSource.manager.save(user);
	
		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

//delete
router.delete("/user/myprofile:id", async (req, res) => {
	const userId: number = parseInt(req.params.id);

	try {
		const user = await AppDataSource.manager.findOneBy(User, {
			userId: userId,
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