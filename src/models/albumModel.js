import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema({
    name: { type: String, required: true },
    artist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Nghệ sỹ
    image: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Trạng thái album
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], // Danh sách bài hát,
    bg_colour: { type: String, default: "#ffffff" },
    desc: { type: String, },
    viewCount: { type: Number, default: 0 }, // Đếm lượt xem album
    downloadCount: { type: Number, default: 0 } // Đếm lượt tải xuống album
}, { timestamps: true });

export default mongoose.model('Album', AlbumSchema);
