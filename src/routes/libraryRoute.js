import express from 'express';
import { getLibrary, updateLibrary, deleteLibrary, pushLibrary, removeFromLibrary } from '../controllers/libraryController.js';
import authen from '../middleware/authen.js';

const libraryRouter = express.Router();

libraryRouter.get('/', authen, getLibrary);
libraryRouter.put('/', authen, updateLibrary);
libraryRouter.put('/push', authen, pushLibrary);
libraryRouter.put('/remove', authen, removeFromLibrary);
libraryRouter.delete('/', authen, deleteLibrary);

export default libraryRouter;