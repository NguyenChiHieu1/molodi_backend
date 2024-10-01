import userModel from '../models/userModel.js';

const authorMiddleware = (allowedRoles) => {
    return async (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userRoles = await userModel.findById(user._id).populate('roles', 'name'); // Lấy roles từ user
        const userRoleNames = userRoles.roles.map(role => role.name); // Lấy tên role

        const hasRole = userRoleNames.some(role => allowedRoles.includes(role)); // Kiểm tra nếu có role phù hợp

        if (!hasRole) {
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    };
};

export default authorMiddleware;
