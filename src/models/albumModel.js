import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema({
    name: { type: String, required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Nghệ sỹ
    cover_image: { type: String }, // URL ảnh bìa album
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Trạng thái album
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], // Danh sách bài hát,
    bg_colour: { type: String }
}, { timestamps: true });

export default mongoose.model('Album', AlbumSchema);
