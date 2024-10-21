import express from 'express'
import { addAlbum, getAlbums, updateAlbum, removeAlbum, increaseViewAlbum, increaseDownloadAlbum, getAlbumById } from '../controllers/albumController.js'
import upload from '../middleware/multer.js'
import authen from '../middleware/authen.js'
import author from '../middleware/author.js'
// import validate from "../middleware/validate.js"
// import {} from "../middleware/validationSchema.js"

const albumRouter = express.Router();

albumRouter.post('/add', authen, author(["artist", "leader"]), upload.single('image'), addAlbum);
albumRouter.get('/albums', getAlbums);
albumRouter.get('/:id', getAlbumById);

albumRouter.put('/update/:aid', authen, author(["artist", "leader"]), upload.single('image'), updateAlbum);
albumRouter.put('/view/:aid', authen, author(['listener']), increaseViewAlbum);
albumRouter.put('/download/:aid', authen, author(['listener']), increaseDownloadAlbum);
// albumRouter.delete('/remove/:id', removeAlbum);
albumRouter.delete('/:id', authen, author(["artist", "leader"]), removeAlbum);

export default albumRouter;