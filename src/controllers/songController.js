import { v2 as cloudinary } from 'cloudinary'
import songModel from '../models/songModel.js';

const addSong = async (req, res) => {
    try {
        const { name, desc, album } = req.body; // Sử dụng destructuring để lấy dữ liệu

        // Kiểm tra xem các trường yêu cầu có tồn tại không
        if (!name || !desc || !album || !req.files.audio || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const audioFile = req.files.audio[0]; // Kiểm tra nếu req.files.audio tồn tại
        const imageFile = req.files.image[0];

        // Upload file audio và image lên Cloudinary
        const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
            resource_type: "video",
            folder: "songs"
        });
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
            folder: "album_covers"
        });
        const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60)}`

        const songData = {
            name,
            desc,
            album,
            file: audioUpload.secure_url,
            image: imageUpload.secure_url,
            duration
        }

        const song = songModel(songData);
        await song.save();
        // Trả về phản hồi với URL của các tệp tải lên
        res.status(200).json({
            success: true,
            message: "Song Added"
        });
    } catch (error) {
        console.error("Error uploading song:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const listSong = async (req, res) => {
    try {
        const allSongs = await songModel.find({});
        res.status(200).json({
            success: true,
            songs: allSongs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error })
    }
}

const removeSong = async (req, res) => {
    try {
        const response = await songModel.findByIdAndDelete(req.params.id);
        if (response) {
            res.status(200).json({ success: true, message: "Song deleted" })
        } else {
            res.status(404).json({ success: false, message: "Song not found" })
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error })
    }
}
export { addSong, listSong, removeSong }