import User from "../models/userModel.js";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";
import { v2 as cloudinary } from 'cloudinary'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Library from "../models/libraryModel.js";
import Playlist from "../models/playlistModel.js";
import Album from "../models/albumModel.js";
import Song from "../models/songModel.js";
// const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/`;

export const register = async (req, res) => {
    try {
        const { username, email, password, roles } = req.body;
        // Kiểm tra email và nickname đã tồn tại chưa
        const findEmail = await User.findOne({ email: email });
        if (findEmail) throw new Error('Email already exists!!!');
        const nameAcc = await User.findOne({ username: username });
        if (nameAcc) throw new Error('Nickname already exists!!!');
        // Tạo mã xác thực email ngẫu nhiên
        // const verificationToken = crypto.randomBytes(32).toString('hex');

        // Tạo người dùng mới với trạng thái email chưa xác thực
        const newUser = await User.create({
            username,
            email,
            password,
            roles: roles,
            // verificationToken,
            emailVerified: false
        });

        if (!newUser) throw new Error('User creation failed!!!');

        // tạo library
        await Library.create({ user: newUser._id });

        // Gửi email xác thực cho người dùng
        // const verificationLink = `${process.env.CLIENT}/user/verify-email/${verificationToken}`;
        // const html = `
        //     Xin chào ${username},<br>
        //     Cảm ơn bạn đã đăng ký tài khoản!<br>
        //     Vui lòng nhấp vào liên kết dưới đây để xác thực email của bạn và kích hoạt tài khoản. Liên kết sẽ hết hạn sau 15 phút:<br>
        //     <a href="${verificationLink}">Click here to verify your email</a><br>
        //     Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.
        // `;

        // Tạo dữ liệu email để gửi
        // const data = {
        //     email: email,
        //     subject: 'Email Verification - Website Molodi',
        //     html,
        //     text: 'Để xác thực email vui lòng click vào link dưới đây'
        // };

        // Gửi email
        // await sendMail(data);

        // Phản hồi thành công
        return res.status(201).json({
            success: true,
            messages: "Account created successfully!",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            messages: error.message
        })
    }
}

//chưa hoàn thiện
export const verifyEmail = async (req, res) => {
    try {
        const { verificationToken } = req.params;

        // Tìm người dùng có mã xác thực trùng khớp
        const user = await User.findOne({ verificationToken: verificationToken });

        if (!user) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid or expired verification code!'
            });
        }

        // Cập nhật trạng thái email đã xác thực và xóa mã xác thực
        user.isEmailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            msg: 'Email verified successfully! Your account is now active.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
}

export const login = async (req, res) => {

    try {
        const { email, password } = req.body;
        const userCheck = await User.findOne({ email: email }).populate("roles", "name");
        // console.log(userCheck)
        if (!userCheck) return res.status(400).json({
            success: true,
            message: 'Not find user account'
        })
        const checkPassWord = await bcrypt.compare(password, userCheck.password);
        if (checkPassWord) {
            // console.log(userCheck)
            const accessToken = await jwt.sign({ _id: userCheck._id, roles: userCheck.roles.name, name: userCheck.username }, process.env.JWT_SECRET, { expiresIn: '2d' })
            return res.status(200).json({
                success: true,
                token: accessToken,
                roles: userCheck.roles.name
            })
        }
        return res.status(400).json({
            success: true,
            message: "Incorrect password"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

//manager-profile: cá nhân -- chỉ đăng nhập thành công mới thay đổi thông tin tài khoản. admin ko thể
export const updateUser = async (req, res) => {
    try {
        const { _id } = req.user;
        // const _id = req.params.id
        let { password } = req.body
        let image = req.file;
        if (Object.keys(req.body).length === 0)
            return res.status(400).json({
                success: false,
                message: "No input value"
            })
        const userUpdate = await User.findById(_id);
        // console.log(userUpdate)
        if (!userUpdate) throw new Error('User not found')
        // 
        let updateData = { ...req.body };
        if (password) {
            // Băm mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        if (image) {
            const upload = await cloudinary.uploader.upload(image.path, {
                resource_type: "image",
                folder: "users"
            });
            // console.log(upload)
            if (userUpdate.profile_image) {
                const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/`;

                let publicId = userUpdate.profile_image.replace(prefix, '');
                publicId = publicId.replace(/v\d+\/(.+)\.\w+$/, '$1');
                const deleteImage = await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
                if (!deleteImage) throw new Error("Delete Profile_Image Old Not Success!!!")
            }
            updateData.profile_image = upload.secure_url;
        }
        // bảo mật:
        updateData.roles = userUpdate.roles;
        const response = await User.findByIdAndUpdate(_id, updateData, { new: true }).select('-role -password')
        if (!response) throw new Error('Error update info account')
        return res.status(200).json({
            success: true,
            messages: 'Update successfully',
            data: response
        })



    } catch (error) {
        return res.status(400).json({
            success: false,
            messages: error.message
        })
    }
}

export const updateUserLeader = async (req, res) => {
    try {
        const _id = req.params.id
        let { password } = req.body
        let image = req.file;
        if (Object.keys(req.body).length === 0)
            return res.status(400).json({
                success: false,
                message: "No input value"
            })
        const userUpdate = await User.findById(_id);
        // console.log(userUpdate)
        if (!userUpdate) throw new Error('User not found')
        // 
        let updateData = { ...req.body };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        if (image) {
            const upload = await cloudinary.uploader.upload(image.path, {
                resource_type: "image",
                folder: "users"
            });
            // console.log(upload)
            if (userUpdate.profile_image) {
                const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/`;

                let publicId = userUpdate.profile_image.replace(prefix, '');
                publicId = publicId.replace(/v\d+\/(.+)\.\w+$/, '$1');
                const deleteImage = await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
                if (!deleteImage) throw new Error("Delete Profile_Image Old Not Success!!!")
            }
            updateData.profile_image = upload.secure_url;
        }
        // bảo mật:
        updateData.roles = req.body.roles;
        const response = await User.findByIdAndUpdate(_id, updateData, { new: true }).select('-role -password')
        if (!response) throw new Error('Error update info account')

        // 
        const findLibrary = await Library.findOne({ user: _id })
        if (!findLibrary) {
            await Library.create({ user: _id });
        }

        return res.status(200).json({
            success: true,
            messages: 'Update successfully'
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            messages: error.message
        })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const uid = req.params.uid;

        // Tìm kiếm người dùng
        const user = await User.findById(uid).select('-password -role');
        if (!user) {
            return res.status(404).json({
                success: false,
                messages: "No account found"
            });
        }

        // Xóa người dùng
        const deleteUser = await User.findByIdAndDelete(uid);
        if (!deleteUser) {
            return res.status(400).json({
                success: false,
                messages: "Delete account not successful"
            });
        }

        // Xóa ảnh hồ sơ nếu có
        if (user.profile_image) {
            const prefixxx = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/`;
            let publicId = deleteUser.profile_image.replace(prefixxx, '');
            publicId = publicId.replace(/v\d+\/(.+)\.\w+$/, '$1');

            // Xóa ảnh khỏi Cloudinary
            const deleteImage = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
            if (deleteImage.result !== "ok") {
                throw new Error("Failed to delete old profile image!");
            }
        }

        // Tìm và xóa tất cả thư viện liên quan đến người dùng
        const findLibrary = await Library.findOne({ user: uid });
        if (findLibrary) {
            await Library.deleteMany({ user: uid });
        }

        // Tìm và xóa tất cả playlist liên quan đến người dùng
        const findPlaylist = await Playlist.findOne({ user: uid });
        if (findPlaylist) {
            await Playlist.deleteMany({ user: uid });
        }

        return res.status(200).json({
            success: true,
            messages: `Account with email ${user.email} deleted successfully`
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            messages: error.message
        });
    }
};


export const createUser = async (req, res) => {
    try {
        const { username, email, password, roles } = req.body;
        const image = req.file;
        const findEmail = await User.findOne({ email: email });
        if (findEmail) throw new Error('Email already exists!!!');
        const nameAcc = await User.findOne({ username: username });
        if (nameAcc) throw new Error('Nickname already exists!!!');
        const user = new User();
        if (image) {
            const uploadImage = await cloudinary.uploader.upload(image.path, {
                resource_type: "image",
                folder: "users"
            });

            user.profile_image = uploadImage.secure_url;
        }

        user.username = username;
        user.email = email;
        user.password = password;
        user.roles = roles;

        const saveNew = await user.save();
        if (!saveNew) throw new Error('User creation failed!!!');

        return res.status(201).json({
            success: true,
            messages: "Account created successfully!",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            messages: error.message
        })
    }
}

export const getUsers = async (req, res) => {
    try {
        // Sao chép các tham số truy vấn từ req.query
        const queries = { ...req.query };

        // Loại bỏ các trường đặc biệt như limit, sort, page, fields
        const excludeFields = ['limit', 'sort', 'page', 'fields'];
        excludeFields.forEach(field => delete queries[field]);

        // Chuyển đổi các tham số so sánh (gte, gt, lt, lte) thành định dạng MongoDB
        let queryString = JSON.stringify(queries);
        queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`);
        const formattedQueries = JSON.parse(queryString);

        formattedQueries._id = { $ne: '6703aabbfcb17cea9b3fc1aa' };
        if (queries?.username) formattedQueries.username = { $regex: queries.username, $options: 'i' };

        // Tạo truy vấn cơ bản cho người dùng
        let queryCommand = User.find(formattedQueries).populate("roles", "name");

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
        const limit = +req.query.limit || process.env.LIMIT_USERS || 10; // Mặc định 10 người dùng mỗi trang
        const skip = (page - 1) * limit;
        queryCommand = queryCommand.skip(skip).limit(limit);

        // Thực thi truy vấn
        const listUsers = await queryCommand.exec();
        const counts = await User.countDocuments(formattedQueries); // Đếm tổng số người dùng

        // Trả kết quả về client
        return res.status(200).json({
            success: true,
            counts: counts, // Tổng số người dùng
            currentPage: page, // Trang hiện tại
            totalPage: Math.ceil(counts / limit), // Tổng số trang
            data: listUsers, // Danh sách người dùng
        });
        // 6703aabbfcb17cea9b3fc1aa
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const findAccound = async (req, res) => {
    try {
        const id = req.params.id
        const findUser = await User.findById(id).populate({ path: 'roles', select: 'name' });
        if (!findUser) throw new Error("Not found song")
        return res.status(200).json({
            success: true,
            data: findUser
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const getArtist = async (req, res) => {
    try {
        const findUser = await User.find({
            roles: "66fba3a49365526bc7e9bd95",
            status: "approved"
        }).select('username profile_image');
        if (!findUser) throw new Error("Not found song")
        return res.status(200).json({
            success: true,
            data: findUser
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })

    }
}

export const addHistoryListenSong = async () => {
    try {
        const id = req.user._id;
        const findUser = await User.findById(id);
        if (!findUser) throw new Error("Not found user")
        findUser.historyListenSong = req.body.historyListenSong;
        await findUser.save()
        return res.status(200).json({
            success: true
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })

    }
}

export const getAlbumSongArtist = async (req, res) => {
    try {
        const id = req.params.id;
        const findAcc = await User.findById(id).populate({
            path: 'roles',
            select: 'name'
        }).select(
            'username profile_image'
        );

        if (findAcc.roles.name !== "artist") {
            return res.status(401).json({
                success: false,
                message: "Not found artist or Are not artist!!!"
            })
        }

        const findAlbums = await Album.find({ artist: id });
        const findSongs = await Song.find({ artist: id });
        return res.status(200).json({
            success: true,
            data: {
                artist: findAcc,
                albums: findAlbums,
                songs: findSongs
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}


export const checkOrCreateLibraryForAllUsers = async (req, res) => {
    try {
        // Lấy tất cả người dùng
        const users = await User.find(); // Có thể thêm điều kiện nếu cần

        // Biến để lưu trữ kết quả
        const results = [];

        for (const user of users) {
            let library = await Library.findOne({ user: user._id });

            if (!library) {
                // Nếu không có, tạo mới một thư viện cho user
                library = new Library({
                    user: user._id,
                    songs: [],
                    playlists: [],
                    albums: [],
                    artistsFollow: []
                });

                await library.save(); // Lưu thư viện mới vào cơ sở dữ liệu
                results.push({
                    user: user._id,
                    message: 'Library created successfully.',
                    data: library
                });
            } else {
                // Nếu đã có thư viện, ghi lại kết quả
                results.push({
                    user: user._id,
                    message: 'Library already exists.',
                    data: library
                });
            }
        }

        // Trả về kết quả
        return res.status(200).json({
            success: true,
            results // Trả về tất cả kết quả
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message // Trả về thông báo lỗi
        });
    }
};

export const getUserInfo = async (req, res) => {
    try {
        const id = req.user._id;
        const findAcc = await User.findById(id).select(
            'username profile_image email'
        );

        return res.status(200).json({
            success: true,
            data: findAcc
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}