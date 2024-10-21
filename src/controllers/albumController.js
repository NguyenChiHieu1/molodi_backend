import Album from '../models/albumModel.js';
import { v2 as cloudinary } from 'cloudinary';
import Role from '../models/roleModel.js';

async function checkRoleArtist(id) {
    const roleArtist = await Role.findById(id);
    if (!roleArtist) throw new Error("Vai trò không tồn tại");
    return roleArtist.name === "artist";
}

//manager-album: artist-leader add||
export const addAlbum = async (req, res) => {
    try {

        const { name } = req.body;
        const id = req.user._id;

        if (!name || !id) {
            return res.status(400).json({
                success: false,
                message: "Name are required "
            });
        }

        const checkname = await Album.findOne({ name: name });
        if (checkname) {
            return res.status(400).json({
                success: false,
                message: "Album name already exists"
            })
        }

        const isArtist = await checkRoleArtist(req.user.roles);
        if (!isArtist && !req.body.artist) {
            return res.status(400).json({
                success: false,
                message: "Artirt are required"
            });
        }

        let imageFile = '';
        const imageUp = req.file ? req.file : null;
        if (imageUp) {
            const imageUpload = await cloudinary.uploader.upload(imageUp.path, {
                resource_type: "image",
                folder: "album_image"
            });
            imageFile = imageUpload.secure_url;
        }

        const newAlbum = new Album({
            name,
            image: imageFile || "",
            artist: isArtist ? id : req.body.artist,
            status: 'pending',
            songs: req.body.songs,
            bg_colour: req.body.bg_colour || '#ffffff',
            desc: req.body.desc
        });

        await newAlbum.save();
        return res.status(200).json({
            success: true,
            message: "Album created successfully",
            data: newAlbum
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

//manager-album: listener, admin -- xem all, artist-- thêm dk: "artist: user-id"-client
export const getAlbums = async (req, res) => {
    try {
        // Sao chép các tham số truy vấn từ req.query
        const queries = { ...req.query };

        // Loại bỏ các trường đặc biệt như limit, sort, page, fields
        const excludeFields = ['limit', 'sort', 'page', 'fields'];
        excludeFields.forEach(field => delete queries[field]);

        // Chuyển đổi các tham số so sánh (gte, gt, lt, lte) thành định dạng MongoDB
        let queryString = JSON.stringify(queries);
        queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`);
        const formatedQueries = JSON.parse(queryString);

        // Tìm kiếm theo tên album (không phân biệt chữ hoa/thường)
        if (queries?.name) {
            formatedQueries.name = { $regex: queries.name, $options: 'i' };
        }

        // Tạo truy vấn cơ bản cho album
        let queryCommand = Album.find(formatedQueries)
            .populate({ path: 'artist', select: 'username' }) // Liên kết với artist (User)
            .populate({ path: 'songs', select: 'title duration artist category image createdAt' }); // Liên kết với songs (Song)

        // Xử lý sắp xếp
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            queryCommand = queryCommand.sort(sortBy);
        } else {
            queryCommand = queryCommand.sort({ createdAt: -1 }); // Mặc định sắp xếp theo ngày tạo mới nhất
        }

        // Giới hạn các trường hiển thị nếu có yêu cầu
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            queryCommand = queryCommand.select(fields);
        }

        // Xử lý phân trang
        const page = +req.query.page || 1;
        const limit = +req.query.limit || process.env.LIMIT_ALBUMS || 10; // Mặc định 10 album mỗi trang
        const skip = (page - 1) * limit;
        queryCommand = queryCommand.skip(skip).limit(limit);

        // Thực thi truy vấn
        const listAlbums = await queryCommand.exec();
        const counts = await Album.find(formatedQueries).countDocuments(); // Đếm tổng số album

        // Trả kết quả về client
        return res.status(200).json({
            success: true,
            counts: counts, // Tổng số album
            currentPage: page, // Trang hiện tại
            totalPage: Math.ceil(counts / limit), // Tổng số trang
            data: listAlbums, // Danh sách album
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

//manager-album: lấy album theo danh sách theo nghệ sỹ: ---desc: dùng cho ?
export const getAlbumById = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id)
        if (!album) {
            return res.status(404).json({
                success: false,
                message: "Album not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: album
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateAlbum = async (req, res) => {
    try {
        const { name, artist, status, bg_colour, viewCount, downloadCount, songs, desc } = req.body;
        if (Object.keys(req.body).length === 0 && Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No input value"
            });
        }

        //--dành cho leader khi update
        const isArtist = await checkRoleArtist(req.user.roles);
        if (!isArtist && !req.body.artist) {
            return res.status(400).json({
                success: false,
                message: "Artist is required"
            });
        }

        const albumId = req.params.aid;
        const imageFile = req.file ? req.file : null;

        // Tìm album theo ID
        const albumOld = await Album.findById(albumId);
        if (!albumOld) throw new Error("Album not found!");

        // Xử lý ảnh mới nếu có
        if (imageFile) {
            const upload = await cloudinary.uploader.upload(imageFile.path, {
                resource_type: "image",
                folder: "album_image"
            });

            // Nếu đã có ảnh cũ, xóa ảnh cũ khỏi Cloudinary
            if (albumOld.image) {
                const prefixImage = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/`;
                let publicId = albumOld.image.replace(prefixImage, '');
                publicId = publicId.replace(/v\d+\/(.+)\.\w+$/, '$1');
                const deleteImage = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
                if (!deleteImage) throw new Error("Delete Old Image Not Successful!");
            }

            albumOld.image = upload.secure_url; // Cập nhật ảnh mới
        }

        // Cập nhật thông tin album
        albumOld.name = name || albumOld.name;
        albumOld.desc = desc || albumOld.desc
        albumOld.artist = isArtist ? albumOld.artist : artist;
        albumOld.status = isArtist || !status ? albumOld.status : status;
        albumOld.songs = !songs[0] ? albumOld.songs : songs;
        // console.log("songs", songs)
        albumOld.bg_colour = bg_colour || albumOld.bg_colour;
        albumOld.viewCount = isArtist || !viewCount ? albumOld.viewCount : viewCount;
        albumOld.downloadCount = isArtist || !downloadCount ? albumOld.downloadCount : downloadCount;

        // Lưu album đã cập nhật
        const updatedAlbum = await albumOld.save();
        if (!updatedAlbum) throw new Error("Album update failed!");

        return res.status(200).json({
            success: true,
            msg: 'Album updated successfully',
            data: updatedAlbum
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

//manager-album: remove- artist-leader
export const removeAlbum = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);

        // Xóa ảnh của album
        if (album) {
            if (album.image) {
                const prefixImage = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/`;
                let publicId = album.image.replace(prefixImage, '');
                publicId = publicId.replace(/v\d+\/(.+)\.\w+$/, '$1');
                const deleteImage = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
                if (!deleteImage) throw new Error("Failed to delete old album image!");
            }

            // Xóa album khỏi cơ sở dữ liệu
            await Album.findByIdAndDelete(req.params.id);

            return res.status(200).json({ success: true, message: "Album deleted successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Album not found" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const increaseViewAlbum = async (req, res) => {
    try {
        const album = await Album.findById(req.params.aid);
        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Album not found!'
            });
        }

        // Tăng số lượt xem lên 1
        album.viewCount += 1;
        await album.save();

        return res.status(200).json({
            success: true,
            album
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const increaseDownloadAlbum = async (req, res) => {
    try {
        const album = await Album.findById(req.params.aid);
        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Album not found!'
            });
        }

        // Tăng số lượt tải xuống lên 1
        album.downloadCount += 1;
        await album.save();

        return res.status(200).json({
            success: true,
            album
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
