import { register, verifyEmail, login, updateUser, deleteUser, createUser } from "../controllers/userController.js"
import express from 'express'
// import upload from "../middleware/multer.js";
import validate from '../middleware/validate.js';
import { registerValidationSchema, loginValidationSchema } from '../middleware/validationSchema.js';
import authen from '../middleware/authen.js';
import author from '../middleware/author.js';
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.post('/register', validate(registerValidationSchema), register);
userRouter.post('/verify-email/:verificationToken', verifyEmail);
userRouter.post('/login', validate(loginValidationSchema), login);
userRouter.post('/create', authen, author(["admin"]), upload.single('image'), createUser);
userRouter.put('/update', authen, upload.single('image'), updateUser);
userRouter.delete('/:uid', authen, author(["admin"]), deleteUser);

export default userRouter;