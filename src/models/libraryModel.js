import mongoose from 'mongoose';

const LibrarySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song', default: [] }],
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', default: [] }],
    albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album', default: [] }],
    artistsFollow: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }]
}, { timestamps: true });

export default mongoose.model('Library', LibrarySchema);
