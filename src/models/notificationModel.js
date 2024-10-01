import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người nhận thông báo
    type: { type: String, required: true }, // Loại thông báo (ví dụ: 'account_approved', 'new_comment')
    message: { type: String, required: true }, // Nội dung thông báo
    isRead: { type: Boolean, default: false }, // Trạng thái đã đọc
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
