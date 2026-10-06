import { Router } from "express";
import passport from "../config/passport.js";
import UserModel from "../schema/usermodel.js";
import jwt from "jsonwebtoken";

const router = Router();

router.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    async (req, res) => {
        // Successful authentication, redirect home.
        try {
            const { id, displayName, emails, photos } = req.user;
            const email = emails[0].value;

            let user = await UserModel.findOne({ email });

            if (!user){
                user = await UserModel.create({
                    googleId: id,
                    name: displayName,
                    email,
                    avatar: photos[0].value
                });
            }

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);   

            res.cookie('token', token);

            res.status(200).json({
                message: "User logged in successfully",
                user,
                token: token
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

export default router;