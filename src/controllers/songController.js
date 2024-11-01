import { v2 as cloudinary } from 'cloudinary'
import Song from '../models/songModel.js';
import Role from '../models/roleModel.js';
import Album from '../models/albumModel.js';

async function checkRoleArtist(id) {
    const roleArtist = await Role.findById(id);
    if (!roleArtist) throw new Error("Vai trò không tồn tại");
    return roleArtist.name === "artist";
}

//manager-song: artist || leader: desc : tạo ca khúc mới 
export const addSong = async (req, res) => {
    try {
        const id = req.user._id;

        const { title } = req.body;

        if (!title || !id || !req.files.audio || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const isArtist = await checkRoleArtist(req.user.roles);

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

        const duration = `${Math.floor(audioUpload.duration / 60).toString().padStart(2, '0')}:${Math.floor(audioUpload.duration % 60).toString().padStart(2, '0')}`;
        const song = new Song();

        song.title = title;
        //kiểm soát người thêm mới bài là nhạc sĩ hay leader:
        song.artist = isArtist ? id : "6703aabbfcb17cea9b3fc1aa";

        if (req.body.album) song.album = req.body.album;
        song.category = req.body.category || "";
        song.audio = audioUpload.secure_url;
        song.duration = duration;
        song.image = imageUpload.secure_url;
        song.status = 'pending';

        await song.save();

        return res.status(200).json({
            success: true,
            message: "Song added successfully!",
            data: song
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

//manager-song: listener : desc: Lấy tất cả tên các ca khúc của tác giả---- 
export const listSong = async (req, res) => {
    try {
        const id = req.params.id
        const allSongs = await Song.findById(id).populate({ path: 'artist', select: 'username' })
            .populate({ path: 'category', select: 'name' });
        ;
        if (!allSongs) throw new Error("Not found song")
        return res.status(200).json({
            success: true,
            data: allSongs
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//manager-song: artist#-only-list-Song-artist-Create --> client
export const getsSong = async (req, res) => {

    try {
        //call Font-end---> lấy all list song| 1 vai song of ca sy
        const queries = { ...req.query };

        const excludeFields = ['limit', 'sort', 'page', 'fields'];
        excludeFields.forEach(field => delete queries[field]);

        let queryString = JSON.stringify(queries);
        queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`);
        const formatedQueries = JSON.parse(queryString);

        // Thay đổi điều kiện cho trường 'title'
        if (queries?.title) formatedQueries.title = { $regex: queries.title, $options: 'i' };

        // Tạo truy vấn cơ bản cho bài hát
        let queryCommand = Song.find(formatedQueries)
            .populate({ path: 'artist', select: 'username' }) // Liên kết với artist (User)
            .populate({ path: 'category', select: 'name' }); // Liên kết với category

        // Xử lý sắp xếp
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            queryCommand = queryCommand.sort(sortBy);
        } else {
            queryCommand = queryCommand.sort({ createdAt: -1 });
        }

        // Xử lý giới hạn trường
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            queryCommand = queryCommand.select(fields);
        }

        // Xử lý phân trang
        const page = +req.query.page || 1;
        const limit = +req.query.limit || process.env.LIMIT_SONGS;
        const skip = (page - 1) * limit;
        queryCommand.skip(skip).limit(limit);


        const listSongs = await queryCommand.exec();
        const counts = await Song.find(formatedQueries).countDocuments();
        return res.status(200).json({
            success: true,
            counts: counts,
            currentPage: page,
            totalPage: Math.ceil(counts / limit),
            data: listSongs,
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//manafer-song: artist || leader :desc: update đc cả nhưng phía client thì khi update thì chỉ có 'title\album\category\image\audio'
export const updateSong = async (req, res) => {
    try {
        const { title, album, category, status, downloadCount, viewCount } = req.body;
        if (Object.keys(req.body).length === 0 && Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No input value"
            })
        }

        const isArtist = await checkRoleArtist(req.user.roles)

        const sid = req.params.id;
        const audioFile = req.files?.audio ? req.files.audio[0] : null;
        const imageFile = req.files?.image ? req.files.image[0] : null;

        // Lấy bài hát hiện tại
        const songOld = await Song.findById(sid);
        if (!songOld) throw new Error("Song not found!");

        // Xử lý ảnh mới
        if (imageFile) {
            const upload = await cloudinary.uploader.upload(imageFile.path, {
                resource_type: "image",
                folder: "album_covers"
            });

            if (songOld.image) {

                const prefixImage = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/`;

                let publicId = songOld.image.replace(prefixImage, '');
                // console.log('publicId-1', publicId)

                publicId = publicId.replace(/v\d+\/(.+)\.\w+$/, '$1');
                // console.log('publicId-2', publicId)

                const deleteImage = await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
                // console.log(deleteImage)
                if (!deleteImage) throw new Error("Delete Image Old Not Success!!!")
            }
            songOld.image = upload.secure_url;
        }

        // Xử lý audio mới
        if (audioFile) {
            const uploadAudio = await cloudinary.uploader.upload(audioFile.path, {
                resource_type: "video",
                folder: "songs"
            });

            if (songOld.audio) {

                const prefixAudio = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/video/upload/`;
                let publicId = songOld.audio.replace(prefixAudio, '');
                publicId = publicId.replace(/v\d+\/(.+)\.\w+$/, '$1');
                const deleteAudio = await cloudinary.uploader.destroy(publicId, { resource_type: "video" })
                if (!deleteAudio) throw new Error("Delete Audio Old Not Success!!!")
            }
            songOld.audio = uploadAudio.secure_url;

            // duration
            songOld.duration = `${Math.floor(uploadAudio.duration / 60)}:${Math.floor(uploadAudio.duration % 60)}`;
        }

        // Cập nhật thông tin bài hát
        songOld.title = title || songOld.title;
        songOld.album = album || songOld.album;
        songOld.category = category || songOld.category;
        songOld.status = isArtist || !status ? songOld.status : status;
        songOld.downloadCount = isArtist || !downloadCount ? songOld.downloadCount : downloadCount;
        songOld.viewCount = isArtist || !viewCount ? songOld.viewCount : viewCount;

        // Lưu bài hát đã cập nhật
        const updatedSong = await songOld.save();
        if (!updatedSong) throw new Error("Song update failed!");

        return res.status(200).json({
            success: true,
            msg: 'Song updated successfully',
            data: updatedSong
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
// remove: leader-arstist
export const removeSong = async (req, res) => {
    try {
        const response = await Song.findById(req.params.id);

        //xóa image
        if (response) {
            if (response.image) {

                const prefixImage = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/`;

                let publicId = response.image.replace(prefixImage, '');
                // console.log('publicId-1', publicId)

                publicId = publicId.replace(/v\d+\/(.+)\.\w+$/, '$1');
                // console.log('publicId-2', publicId)

                const deleteImage = await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
                // console.log(deleteImage)
                if (!deleteImage) throw new Error("Delete Image Old Not Success!!!")
            }
            //xóa audio
            if (response.audio) {

                const prefixAudio = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/video/upload/`;
                let publicSID = response.audio.replace(prefixAudio, '');
                publicSID = publicSID.replace(/v\d+\/(.+)\.\w+$/, '$1');
                const deleteAudio = await cloudinary.uploader.destroy(publicSID, { resource_type: "video" })
                // Kiểm tra kết quả trả về từ cloudinary
                if (deleteAudio.result !== "ok") throw new Error("Delete Audio Old Not Success!!!");
            }

            // Xóa bài hát từ cơ sở dữ liệu
            await Song.findByIdAndDelete(req.params.id);

            // Xóa bài hát khỏi album
            const albumArr = await Album.find();
            albumArr.forEach(async (item) => {
                let ind = item.songs.findIndex(i => i.toString() === req.params.id);
                if (ind !== -1) {
                    item.songs.splice(ind, 1);
                    await item.save();  // Lưu lại album sau khi xóa bài hát
                }
            });

            return res.status(200).json({ success: true, message: "Song deleted" })
        } else {
            return res.status(404).json({ success: false, message: "Song not found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}
// export { addSong, listSong, removeSong }

//Tăng lượt xem khi listener click vào bài hát
export const increaseViewSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.sid).populate({ path: 'artist', select: 'username' }) // Liên kết với artist (User)
            .populate({ path: 'category', select: 'name' }); // Liên kết với category
        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found!'
            });
        }

        // Tăng số lượt xem lên 1
        song.viewCount += 1;
        await song.save();

        return res.status(200).json({
            success: true,
            song
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

//Tăng lượt download khi listener click vào
export const increaseDownloadSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.sid).populate({ path: 'artist', select: 'username' }) // Liên kết với artist (User)
            .populate({ path: 'album', select: 'title' }) // Liên kết với album
            .populate({ path: 'category', select: 'name' }); // Liên kết với category
        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found!'
            });
        }

        // Tăng số lượt xem lên 1
        song.downloadCount += 1;
        await song.save();

        return res.status(200).json({
            success: true,
            song
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


export const songUpdateAll = async (req, res) => {
    try {
        const songs = await Song.find();

        for (let song of songs) {
            const [minutes, seconds] = song.duration.split(':').map(Number);

            const normalizedDuration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            if (song.duration !== normalizedDuration) {
                song.duration = normalizedDuration;
                await song.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "All song durations have been normalized",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}