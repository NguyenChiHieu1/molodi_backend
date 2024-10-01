import { createRole, updateRole, deleteRole, getAllRoles } from "../controllers/roleController.js"
import express from 'express'
import validate from '../middleware/validate.js';
import { createRoleValidationSchema } from '../middleware/validationSchema.js';
import authen from '../middleware/authen.js';
import author from '../middleware/author.js';

const roleRouter = express.Router();

roleRouter.get('/', getAllRoles);
roleRouter.post('/', authen, author(["admin"]), validate(createRoleValidationSchema), createRole);
roleRouter.put('/:rid', authen, author(["admin"]), updateRole);
roleRouter.delete('/:rid', authen, author(["admin"]), deleteRole);

export default roleRouter;