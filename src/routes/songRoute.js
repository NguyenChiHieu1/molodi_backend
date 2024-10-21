import { addSong, listSong, removeSong, getsSong, updateSong, increaseViewSong, increaseDownloadSong } from "../controllers/songController.js"
import express from 'express'
import upload from "../middleware/multer.js";
import validate from '../middleware/validate.js';
// import { createSongValidationSchema } from '../middleware/validationSchema.js';
import authen from '../middleware/authen.js';
import author from '../middleware/author.js';

const songRouter = express.Router();

//artist--
songRouter.post('/', authen, author(['artist', 'leader']), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), addSong);
songRouter.post('/view/:sid', authen, author(['listener']), increaseViewSong);
songRouter.post('/download/:sid', authen, author(['listener']), increaseDownloadSong);
songRouter.get('/list/:id', listSong);
songRouter.get('/songs', getsSong);

songRouter.put('/update/:id', authen, author(['artist', 'leader']), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), updateSong);

songRouter.delete('/:id', authen, author(['artist', 'leader']), removeSong);

export default songRouter;