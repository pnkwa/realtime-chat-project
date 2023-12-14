import express , {Request, Response}from "express";
import multer from "multer";
const router = express.Router();
import {createUser, deleteUser, getAllUsers, getUserById, login, updateUser} from "./user.service";
//get all users
router.get("/user/myprofile", async (req:Request, res:Response) => {
	getAllUsers(req, res);
});


//login
router.post("/user/login", async (req:Request, res:Response) => {
	login(req, res);
});


//get user by id
router.get("/user/myprofile/:id", async (req:Request, res:Response) => {
	getUserById(req, res);
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
router.post("/user/myprofile", uploadfile.single("file"), async (req:Request, res:Response) => {
	createUser(req, res);
});

//update
router.put("/user/myprofile/:id", async (req:Request, res:Response) => {
	updateUser(req, res);
});

//delete
router.delete("/user/myprofile/:id", async (req:Request, res:Response) => {
	deleteUser(req, res);
});


export default router;