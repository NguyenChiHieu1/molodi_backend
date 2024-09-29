import { v2 as cloudinary } from 'cloudinary'
import albumModel from '../models/albumModel.js'

const addAlbum = async (req, res) => {
    try {
        const { name, desc, bgColour } = req.body;
        const imageFile = req.file;
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
            folder: "image_album"
        })

        const albumData = new albumModel({ name, desc, bgColour, image: imageUpload.secure_url })
        albumData.save();
        res.status(201).json({ success: true, message: "Album created successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error })
    }
}

const listAlbum = async (req, res) => {
    try {
        const listAlbum = await albumModel.find({});
        res.status(200).json({ success: true, albums: listAlbum });
    } catch (error) {
        res.status(500).json({ success: false, message: error });
    }
}

const removeAlbum = async (req, res) => {
    try {
        await albumModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Album deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error });
    }
}

export { addAlbum, listAlbum, removeAlbum }