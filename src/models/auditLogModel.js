import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người thực hiện hành động
    action: { type: String, required: true }, // Hành động thực hiện (ví dụ: tạo bài hát, xóa bình luận)
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed } // Chi tiết của hành động
}, { timestamps: true });

export default mongoose.model('AuditLog', AuditLogSchema);
