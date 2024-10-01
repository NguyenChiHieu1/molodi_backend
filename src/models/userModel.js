import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }], // Liên kết với Role Schema
    profile_image: { type: String }, // URL ảnh đại diện
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String }, // Token xác thực email
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Trạng thái tài khoản
}, { timestamps: true });

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

export default mongoose.model('User', UserSchema);
