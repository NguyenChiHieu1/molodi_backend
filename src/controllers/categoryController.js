// controllers/categoryController.js

import Category from '../models/categoryModel.js';

// Tạo mới một danh mục
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = new Category({ name, description });
        await newCategory.save();
        return res.status(201).json({
            success: true,
            message: 'Category created successfully!',
            category: newCategory
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy tất cả danh mục
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy danh mục theo ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found!'
            });
        }
        return res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật danh mục theo ID
export const updateCategory = async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found!'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Category updated successfully!',
            category: updatedCategory
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Xóa danh mục theo ID
export const deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found!'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Category deleted successfully!'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
