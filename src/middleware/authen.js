import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js'; // Đường dẫn đến User model

const authenMiddleware = async (req, res, next) => {
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        // Tách token từ header
        const token = req.headers.authorization.split(' ')[1];

        try {
            // Giải mã token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Tùy chọn: Nếu bạn muốn lấy thêm thông tin chi tiết từ database
            const user = await userModel.findById(decoded._id).select('-password');
            if (!user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }
            // Gắn thông tin user vào request
            req.user = user; // Lưu thông tin chi tiết của người dùng (sau khi lấy từ database)
            next();
        } catch (err) {
            // Nếu có lỗi trong quá trình giải mã hoặc truy vấn
            return res.status(401).json({
                success: false,
                message: 'Invalid access token',
                error: err.message
            });
        }
    } else {
        // Trả về nếu không có token trong header
        return res.status(401).json({
            success: false,
            message: 'Require authentication!!!'
        });
    }
};


export default authenMiddleware;
