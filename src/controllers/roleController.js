import Role from '../models/roleModel.js'; // Đảm bảo đường dẫn đúng

// Tạo mới một role
export const createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const nameCheck = await Role.find({ name: name });
        if (nameCheck.length > 0)
            throw new Error('Role name already exists');
        const newRole = await Role.create({ name, permissions });
        return res.status(201).json({
            success: true,
            role: newRole
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};

// Lấy tất cả roles
export const getAllRoles = async (req, res) => {
    try {

        const roles = await Role.find().select("_id name permissions");
        return res.status(200).json({
            success: true,
            roles
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};


// Cập nhật thông tin một role
export const updateRole = async (req, res) => {
    try {
        const { rid } = req.params;
        const updatedRole = await Role.findByIdAndUpdate(rid, req.body, { new: true });
        if (!updatedRole) throw new Error('Role not found or update failed!!!');
        return res.status(200).json({
            success: true,
            role: updatedRole
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};

// Xóa một role
export const deleteRole = async (req, res) => {
    try {
        const { rid } = req.params;
        const deletedRole = await Role.findByIdAndDelete(rid);
        if (!deletedRole) throw new Error('Role not found or delete failed!!!');
        return res.status(200).json({
            success: true,
            msg: 'Role deleted successfully!'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};
