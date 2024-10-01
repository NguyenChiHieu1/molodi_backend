// routes/categoryRoutes.js

import express from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';
import authen from "../middleware/authen.js"
import author from "../middleware/author.js"
const categoryRouter = express.Router();

// Tạo danh mục mới
categoryRouter.post('/', authen, author(["admin"]), createCategory);

// Lấy tất cả danh mục
categoryRouter.get('/', authen, author(["admin"]), getAllCategories);

// Lấy danh mục theo ID
// categoryRouter.get('/:id', authen, author(["admin"]), getCategoryById);

// Cập nhật danh mục theo ID
categoryRouter.put('/:id', authen, author(["admin"]), updateCategory);

// Xóa danh mục theo ID
categoryRouter.delete('/:id', authen, author(["admin"]), deleteCategory);

export default categoryRouter;
