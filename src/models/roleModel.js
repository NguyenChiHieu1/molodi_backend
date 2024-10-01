import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // leader, artist, listener
    permissions: [{ type: String }] // Danh sách quyền của vai trò này
}, { timestamps: true });

export default mongoose.model('Role', RoleSchema);
