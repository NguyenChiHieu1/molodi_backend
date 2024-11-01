import mongoose from 'mongoose';

const LibrarySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    songs: [{
        song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
        addedAt: { type: Date, default: Date.now }
    }],

    playlists: [{
        playlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' },
        addedAt: { type: Date, default: Date.now }
    }],

    albums: [{
        album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
        addedAt: { type: Date, default: Date.now }
    }],

    artistsFollow: [{
        artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model('Library', LibrarySchema);
