import express from "express";
import userRoutes from "./Users/users.controller";

const app = express();

app.use("/", userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
