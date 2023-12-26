import S3 = require("aws-sdk/clients/s3");
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const bucketName = "voice-messenger";
const region = "ap-southeast-1";
const accessKeyId = "AKIA5DP55HDAB4JV73M5";
const secretAccessKey = "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";
const s3 = new S3({
	region,
	accessKeyId, 
	secretAccessKey
});

// uploads a file to s3
export async function uploadFile(file: { path: string; filename: string; }) {
	try {
		const fileStream = fs.createReadStream(file.path);
        
		console.log(bucketName);
		console.log(region);
		console.log(accessKeyId);
		console.log(secretAccessKey);
  
  
		if (!bucketName) {
			throw new Error("AWS_BUCKET_NAME is not defined in the environment variables.");
		}
  
		const uploadParams = {
			Bucket: bucketName,
			Body: fileStream,
			Key: file.filename
		};
  
		const result = await s3.upload(uploadParams).promise();
		console.log("File uploaded to S3:", result.Location);
  
		return result;
	} catch (error) {
		console.error("Error uploading file to S3:", error);
		throw error; // Re-throw the error to be caught by the calling function
	}
}
  

//download a file from s3