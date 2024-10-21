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
            message: 'Category created successfully!'
            // data: newCategory
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
            data: categories
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        // Lấy các query từ request
        const queries = { ...req.query };

        // Loại bỏ các trường không liên quan để xây dựng truy vấn
        const excludeFields = ['limit', 'sort', 'page', 'fields'];
        excludeFields.forEach((field) => delete queries[field]);

        // Định dạng lại các điều kiện tìm kiếm nếu có (e.g., gte, gt, lt, lte)
        let queryString = JSON.stringify(queries);
        queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, (matchedEl) => `$${matchedEl}`);
        const formatedQueries = JSON.parse(queryString);

        // Thay đổi điều kiện cho trường 'name' để tìm kiếm không phân biệt chữ hoa/thường
        if (queries?.name) formatedQueries.name = { $regex: queries.name, $options: 'i' };

        // Tạo truy vấn cơ bản cho danh sách category
        let queryCommand = Category.find(formatedQueries);

        // Xử lý sắp xếp nếu có tham số `sort`
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            queryCommand = queryCommand.sort(sortBy);
        } else {
            queryCommand = queryCommand.sort({ createdAt: -1 });
        }

        // Xử lý giới hạn trường nếu có tham số `fields`
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            queryCommand = queryCommand.select(fields);
        }

        // Xử lý phân trang
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10; // Số lượng category mỗi trang, mặc định là 10
        const skip = (page - 1) * limit;
        queryCommand = queryCommand.skip(skip).limit(limit);

        // Thực hiện truy vấn và lấy danh sách category
        const listCategories = await queryCommand.exec();
        const counts = await Category.find(formatedQueries).countDocuments();

        // Trả về kết quả với danh sách category và thông tin phân trang
        return res.status(200).json({
            success: true,
            counts: counts,
            currentPage: page,
            totalPage: Math.ceil(counts / limit),
            data: listCategories,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
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
            data: category
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
