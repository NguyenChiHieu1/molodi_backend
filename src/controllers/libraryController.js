import Library from '../models/libraryModel.js';
// import Playlist from '../models/playlistModel.js';

// READ: Lấy thông tin thư viện của người dùng
export const getLibrary = async (req, res) => {
    try {
        const userId = req.user._id;

        const library = await Library.findOne({ user: userId })
            .populate({
                path: 'songs.song',
                select: 'title artist image duration'
            })
            .populate({
                path: 'playlists.playlist',
                select: 'name description image',
                populate: {
                    path: 'user',
                    select: 'username'
                }
            })
            .populate({
                path: 'albums.album',
                select: 'title artist image releaseDate'
            })
            .populate({
                path: 'artistsFollow.artist',
                select: 'username profile_image _id'
            })
        // .lean();

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
        if (songs) {
            // Kiểm tra nếu không phải là mảng, trả về lỗi
            if (!Array.isArray(songs)) {
                return res.status(400).json({
                    success: false,
                    message: 'Songs must be an array'
                });
            }
            library.songs = songs.map(song => ({
                song,
                addedAt: Date.now() // Cập nhật thời gian thêm
            }));
        }

        if (playlists) {
            // Kiểm tra nếu không phải là mảng, trả về lỗi
            if (!Array.isArray(playlists)) {
                return res.status(400).json({
                    success: false,
                    message: 'Playlists must be an array'
                });
            }
            library.playlists = playlists.map(playlist => ({
                playlist,
                addedAt: Date.now() // Cập nhật thời gian thêm
            }));
        }

        if (albums) {
            // Kiểm tra nếu không phải là mảng, trả về lỗi
            if (!Array.isArray(albums)) {
                return res.status(400).json({
                    success: false,
                    message: 'Albums must be an array'
                });
            }
            library.albums = albums.map(album => ({
                album,
                addedAt: Date.now() // Cập nhật thời gian thêm
            }));
        }

        if (artistsFollow) {
            // Kiểm tra nếu không phải là mảng, trả về lỗi
            if (!Array.isArray(artistsFollow)) {
                return res.status(400).json({
                    success: false,
                    message: 'ArtistsFollow must be an array'
                });
            }
            library.artistsFollow = artistsFollow.map(artist => ({
                artist,
                addedAt: Date.now() // Cập nhật thời gian thêm
            }));
        }

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
}

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
        const userId = req.user._id; // Lấy ID người dùng từ req
        const { song, album, artist, playlist } = req.body; // Lấy thông tin từ body

        const library = await Library.findOne({ user: userId });
        if (!library) {
            return res.status(404).json({
                success: false,
                message: 'Library not found'
            });
        }

        // Thêm bài hát vào thư viện
        if (song) {
            const checkSong = library.songs.some(item => item.song.toString() === song.toString());
            if (!checkSong) {
                library.songs.push({ song, addedAt: new Date() }); // Thêm với thời gian
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Song already exists in the library!'
                });
            }
        }

        // Thêm album vào thư viện
        if (album) {
            const checkAlbum = library.albums.some(item => item.album.toString() === album.toString());
            if (!checkAlbum) {
                library.albums.push({ album, addedAt: new Date() }); // Thêm với thời gian
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Album already exists in the library!'
                });
            }
        }

        // Thêm nghệ sĩ vào danh sách theo dõi
        if (artist) {
            const checkArtist = library.artistsFollow.some(item => item.artist.toString() === artist.toString());
            if (!checkArtist) {
                library.artistsFollow.push({ artist, addedAt: new Date() }); // Thêm với thời gian
            }
        }

        // Thêm playlist vào thư viện
        if (playlist) {
            const checkPlaylist = library.playlists.some(item => item.playlist.toString() === playlist.toString());
            if (!checkPlaylist) {
                library.playlists.push({ playlist, addedAt: new Date() }); // Thêm với thời gian
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Playlist already exists in the library!'
                });
            }
        }

        await library.save(); // Lưu lại thay đổi
        return res.status(200).json({
            success: true,
            message: 'Library updated successfully.',
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
        const userId = req.user._id; // Lấy ID người dùng từ req
        const { song, album, artist, playlist } = req.body; // Lấy thông tin từ body

        const library = await Library.findOne({ user: userId });
        if (!library) {
            return res.status(404).json({
                success: false,
                message: 'Library not found',
            });
        }

        // Xóa bài hát khỏi thư viện
        if (song) {
            const songIndex = library.songs.findIndex(item => item.song.toString() === song.toString());
            if (songIndex > -1) {
                library.songs.splice(songIndex, 1); // Xóa bài hát khỏi mảng songs
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Song not found in library'
                });
            }
        }

        // Xóa album khỏi thư viện
        if (album) {
            const albumIndex = library.albums.findIndex(item => item.album.toString() === album.toString());
            if (albumIndex > -1) {
                library.albums.splice(albumIndex, 1); // Xóa album khỏi mảng albums
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Album not found in library'
                });
            }
        }

        // Xóa nghệ sĩ khỏi thư viện
        if (artist) {
            const artistIndex = library.artistsFollow.findIndex(item => item.artist.toString() === artist.toString());
            if (artistIndex > -1) {
                library.artistsFollow.splice(artistIndex, 1); // Xóa nghệ sĩ khỏi mảng artistsFollow
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Artist not found in library'
                });
            }
        }

        // Xóa playlist khỏi thư viện
        if (playlist) {
            const playlistIndex = library.playlists.findIndex(item => item.playlist.toString() === playlist.toString());
            if (playlistIndex > -1) {
                library.playlists.splice(playlistIndex, 1); // Xóa playlist khỏi mảng playlists
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Playlist not found in library'
                });
            }
        }

        await library.save(); // Lưu lại thay đổi

        return res.status(200).json({
            success: true,
            message: 'Item removed from library successfully',
            data: library // Trả về thư viện đã được cập nhật
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
