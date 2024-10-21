import Library from '../models/libraryModel.js';
import Playlist from '../models/playlistModel.js';

// READ: Lấy thông tin thư viện của người dùng
export const getLibrary = async (req, res) => {
    try {
        const userId = req.user._id;

        const library = await Library.findOne({ user: userId })
            .populate('songs')
            .populate({
                path: 'playlists',
                populate: {
                    path: 'user',
                    select: 'username'
                }
            })
            .populate('albums')
            .populate('artistsFollow', 'username _id profile_image')

        if (!library) {
            return res.status(404).json({
                success: false,
                message: 'Library not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: library
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE: Cập nhật thư viện của người dùng
export const updateLibrary = async (req, res) => {
    try {
        const userId = req.user._id;
        const { songs, playlists, albums, artistsFollow } = req.body;

        const library = await Library.findOne({ user: userId });
        if (!library) {
            return res.status(404).json({
                success: false,
                message: 'Library not found'
            });
        }

        // Cập nhật thư viện
        library.songs = songs || library.songs;
        library.playlists = playlists || library.playlists;
        library.albums = albums || library.albums;
        library.artistsFollow = artistsFollow || library.artistsFollow;

        await library.save();

        return res.status(200).json({
            success: true,
            message: 'Library updated successfully',
            data: library
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE: Xóa thư viện của người dùng
export const deleteLibrary = async (req, res) => {
    try {
        const userId = req.user._id;

        const library = await Library.findOneAndDelete({ user: userId });
        if (!library) {
            return res.status(404).json({
                success: false,
                message: 'Library not found'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const pushLibrary = async (req, res) => {
    try {
        const userId = req.user._id;
        const { song, album, artist, playlist } = req.body
        const library = await Library.findOne({ user: userId });
        if (!library) {
            return res.status(404).json({
                success: false,
                message: 'Library not found'
            });
        }
        // Thêm album mới vào thư viện
        if (song) {
            const checkSong = library.songs.some(item => item.toString() === song.toString());
            if (!checkSong) {
                library.songs.push(song); // Chỉ thêm khi chưa có trong danh sách
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Song already exists in the library!'
                })
            }
        }

        if (album) {
            const checkAlbum = library.albums.some(item => item.toString() === album.toString());
            if (!checkAlbum) {
                library.albums.push(album);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Album already exists in the library!'
                })
            }
        }

        if (artist) {
            const checkArtist = library.artistsFollow.some(item => item.toString() === artist.toString());
            if (!checkArtist) {
                library.artistsFollow.push(artist);
            }
        }

        if (playlist) {
            const checkPlaylist = library.playlists.some(item => item.toString() === playlist.toString());
            if (!checkPlaylist) {
                library.playlists.push(playlist);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Playlists already exists in the library!'
                })
            }
        }

        await library.save();
        return res.status(200).json({
            success: true,
            message: 'Album added to library',
            data: library
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const removeFromLibrary = async (req, res) => {
    try {
        const userId = req.user._id;
        const { song, album, artist, playlist } = req.body;
        const library = await Library.findOne({ user: userId });
        console.log("song", song)
        console.log("album", album)
        console.log("artist", artist)
        console.log("playlist", playlist)
        if (!library) {
            return res.status(404).json({
                success: false,
                message: 'Library not found',
            });
        }

        // Xóa bài hát khỏi thư viện
        if (song) {
            const songIndex = library.songs.findIndex(item => item.toString() === song.toString());
            if (songIndex > -1) {
                library.songs.splice(songIndex, 1); // Xóa bài hát khỏi mảng songs
            }
        }

        // Xóa album khỏi thư viện
        if (album) {
            const albumIndex = library.albums.findIndex(item => item.toString() === album.toString());
            if (albumIndex > -1) {
                library.albums.splice(albumIndex, 1); // Xóa album khỏi mảng albums
            }
        }

        // Xóa nghệ sĩ khỏi thư viện
        if (artist) {
            const artistIndex = library.artistsFollow.findIndex(item => item.toString() === artist.toString());
            if (artistIndex > -1) {
                library.artistsFollow.splice(artistIndex, 1); // Xóa nghệ sĩ khỏi mảng artistsFollow
            }
        }

        // Xóa playlist khỏi thư viện
        if (playlist) {
            const playlistInDb = await Playlist.findById(playlist);
            if (!playlistInDb) {
                return res.status(404).json({
                    success: false,
                    message: 'Playlist not found in database',
                });
            }
            const playlistIndex = library.playlists.findIndex(item => item.toString() === playlist.toString());
            if (playlistIndex > -1) {
                library.playlists.splice(playlistIndex, 1); // Xóa playlist khỏi mảng playlists

            }
            await Playlist.findByIdAndDelete(playlist);
            //xóa khỏi library cug xóa ra khỏi playlist
        }

        await library.save();

        return res.status(200).json({
            success: true,
            message: 'Item removed from library successfully',
            data: library
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
