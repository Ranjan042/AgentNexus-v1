import transporter from "./config/nodemailer.js";

const testEmail = async () => {
    try {
        console.log("HOST:", process.env.SMTP_HOST);
        console.log("PORT:", process.env.SMTP_PORT);
        await transporter.verify();
        console.log("SMTP connection successful!");

        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: "mantoshkumar04728@gmail.com",
            subject: "Notification Service Test",
            text: "Your notification microservice is working!",
        });

        console.log("Email sent:", info.messageId);
    } catch (error) {
        console.error("Email error:", error);
    }
};

testEmail();