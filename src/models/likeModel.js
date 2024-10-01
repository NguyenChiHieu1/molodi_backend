import mongoose from 'mongoose';

const LikeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người dùng đã thích
    contentType: { type: String, enum: ['song', 'album'], required: true }, // Bài hát hoặc album
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'contentType' }, // ID bài hát hoặc album
}, { timestamps: true });

export default mongoose.model('Like', LikeSchema);
