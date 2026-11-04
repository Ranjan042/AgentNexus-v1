import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env before creating transporter
dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
});

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Error connecting to SMTP server:", error);
    } else {
        console.log("SMTP server is ready to send emails");
    }
});



export default transporter;