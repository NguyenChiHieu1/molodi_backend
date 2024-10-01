import { addSong, listSong, removeSong, } from "../controllers/songController.js"
import express from 'express'
import upload from "../middleware/multer.js";
import validate from '../middleware/validate.js';
// import { createSongValidationSchema } from '../middleware/validationSchema.js';
import authen from '../middleware/authen.js';
import author from '../middleware/author.js';

const songRouter = express.Router();

//artist--
songRouter.post('/', authen, author(['artist']), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), addSong);

songRouter.get('/list', listSong);

songRouter.delete('/remove/:id', authen, author(['artist', 'leader']), removeSong);


export default songRouter;