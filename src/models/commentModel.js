import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người bình luận
    song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true }, // Bài hát được bình luận
    content: { type: String, required: true },
    status: { type: String, enum: ['visible', 'hidden'], default: 'visible' }, // Trạng thái bình luận
}, { timestamps: true });

export default mongoose.model('Comment', CommentSchema);
