import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    projects_posted: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
    is_banned: { type: Boolean, required: false, default: false },
    role: { type: String, require: false, default: "prof" },
    is_admin: { type: Boolean, required: false, default: false },
    token: { type: String, default: "H" },
    seckey: { type: String, required: false, default: process.env.JWT_SECRET },
});

const User = mongoose.model("User", userSchema);
export default User;
