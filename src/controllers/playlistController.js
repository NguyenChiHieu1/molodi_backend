import Playlist from '../models/playlistModel.js';
// import Library from '../models/libraryModel.js';
import { v2 as cloudinary } from 'cloudinary';

export const createPlaylist = async (req, res) => {
    try {
        const { name, songs, description, status } = req.body;
        const userId = req.user._id;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Playlist name is required"
            });
        }
        const checkName = await Playlist.find({ name: name })
        if (checkName.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Playlist name already exists"
            });
        }
        // Upload cover image nếu có
        let coverImage = '';
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                resource_type: "image",
                folder: "playlist_cover"
            });
            coverImage = uploadResult.secure_url;
        }

        // Tạo playlist mới
        const newPlaylist = new Playlist({
            name,
            user: userId, // Gán người dùng tạo playlist
            songs: songs || [],
            image: coverImage,
            description: description || '',
            listenedCount: 0, // Mặc định số lượng người nghe bằng 0
            status: status
        });

        // Lưu playlist vào DB
        // await newPlaylist.save();
        // const findLibrary = await Library.findOne({
        //     user: userId
        // })
        // if (findLibrary) {
        //     findLibrary.playlists.push(newPlaylist._id);
        //     await findLibrary.save();
        // }
        return res.status(201).json({
            success: true,
            message: "Playlist created successfully",
            data: newPlaylist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const updatePlaylist = async (req, res) => {
    try {
        const { name, songs, description, status } = req.body;
        const playlistId = req.params.id;
        const userId = req.user._id; // Lấy userId từ JWT hoặc session

        // Tìm playlist theo ID
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        // Kiểm tra quyền sửa playlist (người tạo playlist phải là người gửi request)
        if (playlist.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to update this playlist"
            });
        }

        // Nếu có cover image mới, thì upload lên cloudinary
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                resource_type: "image",
                folder: "playlist_cover"
            });

            if (playlist.image) {
                const prefixImage = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/`;
                let publicId = playlist.image.replace(prefixImage, '');
                publicId = publicId.replace(/v\d+\/(.+)\.\w+$/, '$1');
                const deleteImage = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
                if (!deleteImage) throw new Error("Delete Old Image Not Successful!");
            }

            playlist.image = uploadResult.secure_url;
        }

        // Cập nhật các thông tin khác của playlist
        playlist.name = name || playlist.name;
        playlist.songs = songs || playlist.songs;
        playlist.description = description || playlist.description;
        playlist.status = status || playlist.status;

        // Lưu playlist sau khi cập nhật
        const updatedPlaylist = await playlist.save();

        return res.status(200).json({
            success: true,
            message: "Playlist updated successfully",
            data: updatedPlaylist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const deletePlaylist = async (req, res) => {
    try {
        const playlistId = req.params.id;
        const userId = req.user._id;

        // Tìm playlist theo ID
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        if (playlist.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to delete this playlist"
            });
        }

        if (playlist.image) {
            const prefixImage = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/`;
            let publicId = playlist.image.replace(prefixImage, '');
            publicId = publicId.replace(/v\d+\/(.+)\.\w+$/, '$1');
            const deleteImage = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
            if (!deleteImage) throw new Error("Delete Old Image Not Successful!");
        }

        await Playlist.findByIdAndDelete(playlistId);

        // const findLibrary = await Library.findOne({
        //     user: userId
        // })
        // if (findLibrary) {
        //     findLibrary.playlists.pop(playlistId);
        //     await findLibrary.save();
        // } 
        return res.status(200).json({
            success: true,
            message: "Playlist deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const getPlaylistId = async (req, res) => {
    try {
        const playlistId = req.params.id;

        // Tìm playlist theo ID, đồng thời populate các bài hát và người tạo playlist
        const playlist = await Playlist.findById(playlistId)
            .populate({
                path: 'songs', // Populate 'songs'
                select: '-downloadCount -viewCount',
                populate: { path: 'category' }
            })
            .populate('user', 'name');


        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: playlist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const getPlaylist = async (req, res) => {
    try {
        // Tìm playlist theo ID, đồng thời populate các bài hát và người tạo playlist
        const playlist = await Playlist.find()
            .populate({
                path: 'songs', // Populate 'songs'
                select: '-downloadCount -viewCount -status',
                populate: { path: 'category' }
            })
            .populate(
                'user', "username"
            )

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        return res.status(200).json({
            success: true,
            count: playlist.length,
            data: playlist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getPlaylistPublic = async (req, res) => {
    try {
        const playlist = await Playlist.find({ status: "public" })
            .populate({
                path: 'songs', // Populate 'songs'
                select: '-downloadCount -viewCount -status',
                populate: { path: 'category' }
            })
            .populate(
                'user', "username"
            )

        return res.status(200).json({
            success: true,
            count: playlist.length,
            data: playlist
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const addlistenedCount = async (req, res) => {
    try {
        const playlistId = req.params.id;

        // Tìm playlist theo ID
        const playlist = await Playlist.findById(playlistId).select("listenedCount");
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        // Tăng số lượng người nghe
        playlist.listenedCount += 1;
        await playlist.save();

        return res.status(200).json({
            success: true,
            message: "Listener count increased",
            data: playlist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const addSongToPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body; // Lấy playlistId và songId từ request body
        const playlist = await Playlist.findById(playlistId.toString()); // Tìm playlist theo ID

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found',
            });
        }

        // Kiểm tra xem bài hát đã tồn tại trong playlist chưa
        const checkSong = playlist.songs.some(item => item.toString() === songId.toString());
        if (checkSong) {
            return res.status(400).json({
                success: false,
                message: 'Song already exists in the playlist',
            });
        }

        // Thêm bài hát vào playlist
        playlist.songs.push(songId);

        // Lưu lại playlist sau khi đã thêm bài hát
        await playlist.save();

        return res.status(200).json({
            success: true,
            message: 'Song added to playlist successfully',
            data: playlist,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body; // Lấy playlistId và songId từ request body
        const playlist = await Playlist.findById(playlistId); // Tìm playlist theo ID

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found',
            });
        }

        // Tìm vị trí của bài hát trong playlist
        const songIndex = playlist.songs.findIndex(item => item.toString() === songId.toString());

        if (songIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'Song not found in the playlist',
            });
        }

        // Xóa bài hát khỏi playlist
        playlist.songs.splice(songIndex, 1);

        // Lưu lại playlist sau khi đã xóa bài hát
        await playlist.save();

        return res.status(200).json({
            success: true,
            message: 'Song removed from playlist successfully',
            data: playlist,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
