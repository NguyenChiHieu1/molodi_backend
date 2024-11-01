import express from 'express'
import { addlistenedCount, createPlaylist, deletePlaylist, getPlaylist, getPlaylistId, updatePlaylist, removeSongFromPlaylist, addSongToPlaylist, getPlaylistPublic } from '../controllers/playlistController.js'
import upload from '../middleware/multer.js'
import authen from '../middleware/authen.js'

const playlistRouter = express.Router();

playlistRouter.put('/push', authen, addSongToPlaylist);
playlistRouter.put('/remove', authen, removeSongFromPlaylist);
playlistRouter.post('/add', authen, upload.single('image'), createPlaylist);
playlistRouter.get('/list', getPlaylist);
playlistRouter.get('/all-public', getPlaylistPublic);
playlistRouter.get('/:id', authen, getPlaylistId);
playlistRouter.put('/:id', authen, upload.single('image'), updatePlaylist);
playlistRouter.put('/listened/:id', authen, addlistenedCount);

playlistRouter.delete('/:id', authen, deletePlaylist);

export default playlistRouter;