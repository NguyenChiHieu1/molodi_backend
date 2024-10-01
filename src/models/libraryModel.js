import mongoose from 'mongoose';

const LibrarySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Listener
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], // Danh sách bài hát trong thư viện
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }] // Danh sách playlist (nếu có)
}, { timestamps: true });

export default mongoose.model('Library', LibrarySchema);
