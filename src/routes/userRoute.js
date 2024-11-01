import { register, verifyEmail, login, updateUser, deleteUser, createUser, getUsers, findAccound, updateUserLeader, getArtist, addHistoryListenSong, getAlbumSongArtist, checkOrCreateLibraryForAllUsers, getUserInfo } from "../controllers/userController.js"
import express from 'express'
// import upload from "../middleware/multer.js";
import validate from '../middleware/validate.js';
import { registerValidationSchema, loginValidationSchema } from '../middleware/validationSchema.js';
import authen from '../middleware/authen.js';
import author from '../middleware/author.js';
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.get('/', getUsers);
userRouter.get('/save', checkOrCreateLibraryForAllUsers);
userRouter.get('/artist', getArtist);
userRouter.get('/info-artist/:id', getAlbumSongArtist);
userRouter.get('/info-user', authen, getUserInfo);
userRouter.get('/findAccount/:id', authen, author(["leader"]), findAccound);
userRouter.post('/register', validate(registerValidationSchema), register);
userRouter.post('/verify-email/:verificationToken', verifyEmail);
userRouter.post('/login', validate(loginValidationSchema), login);
userRouter.post('/create', authen, author(["leader"]), upload.single('image'), createUser);
userRouter.put('/update', authen, upload.single('profile_image'), updateUser);
userRouter.put('/history', authen, addHistoryListenSong);
userRouter.put('/update-leader/:id', authen, author(["leader"]), upload.single('image'), updateUserLeader);
userRouter.delete('/:uid', authen, author(["leader"]), deleteUser);

export default userRouter;