import User from "../models/userModel.js";
import Libarary from "../models/libraryModel.js";
import crypto from "crypto";
import sendMail from "../config/sendMail.js";
import { v2 as cloudinary } from 'cloudinary'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/`;

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
        if (!userCheck) throw new Error('Not find user account')
        const checkPassWord = await bcrypt.compare(password, userCheck.password);
        if (checkPassWord) {
            const accessToken = await jwt.sign({ _id: userCheck._id, roles: userCheck.roles.name }, process.env.JWT_SECRET, { expiresIn: '2d' })
            return res.status(200).json({
                success: true,
                token: accessToken
            })
        }
        throw new Error("Incorrect password");
    } catch (error) {
        return res.status(400).json({
            success: false,
            messages: error.message
        })
    }
};

export const updateUser = async (req, res) => {
    try {
        const { _id } = req.user;
        let { passwordNew, passwordOld } = req.body
        let image = req.file;
        if (Object.keys(req.body).length === 0) throw new Error("No input value")
        const userUpdate = await User.findById(_id);
        // console.log(userUpdate)
        if (!userUpdate) throw new Error('User not found')
        // 
        let updateData = { ...req.body };
        if (passwordNew && passwordOld) {
            // console.log("passwordNew-" + passwordNew + "-passwordOld-" + passwordOld)
            // Kiểm tra xem mật khẩu cũ có khớp với mật khẩu hiện tại không
            const isMatch = await bcrypt.compare(passwordOld, userUpdate.password)
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    messages: "Old password is incorrect!"
                });
            }

            // Băm mật khẩu mới
            updateData.password = passwordNew;
        }
        //


        if (image) {
            const upload = await cloudinary.uploader.upload(image.path, {
                resource_type: "image",
                folder: "users"
            });
            // console.log(upload)
            if (userUpdate.profile_image) {

                let publicId = userUpdate.profile_image.replace(prefix, '');
                publicId = publicId.replace(/v\d+\/(.+)\.\w+$/, '$1');
                const deleteImage = await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
                if (!deleteImage) throw new Error("Delete Profile_Image Old Not Success!!!")
            }
            updateData.profile_image = upload.secure_url;
        }
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

export const deleteUser = async (req, res) => {
    try {
        const uid = req.params.uid;
        // console.log(uid)
        const user = await User.findById(uid).select('-password -role');
        if (!user) return res.status(404).json({
            success: false,
            messages: "No found account"
        })
        const deleteUser = await User.findByIdAndDelete(uid);
        // console.log(deleteUser)
        if (!deleteUser)
            return res.status(400).json({
                success: false,
                messages: "Delete account not success"
            })
        if (user.profile_image) {
            let publicId = deleteUser.profile_image.replace(prefix, '');
            publicId = publicId.replace(/v\d+\/(.+)\.\w+$/, '$1');
            const deleteImage = await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
            if (!deleteImage) throw new Error("Delete Profile_Image Old Not Success!!!")
        }
        return res.status(200).json({
            success: true,
            messages: `Account user with email ${user.email} delete success`
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            messages: error.message
        })
    }
}

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