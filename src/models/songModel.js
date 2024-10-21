import mongoose from 'mongoose';

const SongSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // Liên kết với danh mục
    duration: { type: String }, // Thời gian bài hát (phút)
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    downloadCount: { type: Number, default: 0 }, // Số lượt tải về
    viewCount: { type: Number, default: 0 }, // Số lượt nghe
    image: { type: String, required: true },
    audio: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Song', SongSchema);
