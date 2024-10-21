import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], // Danh sách bài hát trong playlist
    image: { type: String },
    description: { type: String },
    listenedCount: { type: Number },
    status: { type: String, enum: ['public', 'private', 'cancel'], default: 'public' }
}, { timestamps: true });

export default mongoose.model('Playlist', PlaylistSchema);
