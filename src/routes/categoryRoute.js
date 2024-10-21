// routes/categoryRoutes.js

import express from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategories,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';
import authen from "../middleware/authen.js"
import author from "../middleware/author.js"
const categoryRouter = express.Router();

// Tạo danh mục mới
categoryRouter.post('/', authen, author(["leader"]), createCategory);

// Lấy tất cả danh mục
categoryRouter.get('/', getAllCategories);
categoryRouter.get('/categories', getCategories);

// Lấy danh mục theo ID
categoryRouter.get('/:id', authen, author(["leader"]), getCategoryById);

// Cập nhật danh mục theo ID
categoryRouter.put('/:id', authen, author(["leader"]), updateCategory);

// Xóa danh mục theo ID
categoryRouter.delete('/:id', authen, author(["leader"]), deleteCategory);

export default categoryRouter;
