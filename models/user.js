import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
    {
        uid: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        surname: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: false,
            default: "user"
        }
    },
    { timestamps: true }
)

const User = mongoose.models.User || mongoose.model("User",  userSchema);
export default User;