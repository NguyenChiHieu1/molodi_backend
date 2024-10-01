import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Listener tạo playlist
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], // Danh sách bài hát trong playlist
    cover_image: { type: String }, // URL ảnh bìa của playlist
    description: { type: String }
}, { timestamps: true });

export default mongoose.model('Playlist', PlaylistSchema);
