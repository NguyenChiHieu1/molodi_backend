import { v2 as cloudinary } from 'cloudinary'
import Song from '../models/songModel.js';


const addSong = async (req, res) => {
    try {
        const artist = req.user._id;
        const { title } = req.body;

        if (!title || !artist || !req.files.audio || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const audioFile = req.files.audio[0];
        const imageFile = req.files.image[0];

        const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
            resource_type: "video",
            folder: "songs"
        });

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
            folder: "album_covers"
        });

        const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60)}`;
        const song = new Song();


        song.title = title
        song.artist = artist
        if (req.body.album) song.album = req.body.album
        song.category = req.body.category || ""
        song.audio = audioUpload.secure_url
        song.duration = duration
        song.image = imageUpload.secure_url
        song.status = 'pending'


        await song.save();

        res.status(200).json({
            success: true,
            message: "Song added successfully!",
            data: song
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
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