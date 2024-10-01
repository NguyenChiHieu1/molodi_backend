import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người báo cáo
    contentType: { type: String, enum: ['song', 'comment'], required: true }, // Loại nội dung được báo cáo
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'contentType' }, // ID của bài hát hoặc bình luận
    reason: { type: String, required: true }, // Lý do báo cáo
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' }, // Trạng thái xử lý
}, { timestamps: true });

export default mongoose.model('Report', ReportSchema);
