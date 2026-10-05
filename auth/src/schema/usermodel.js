import mongoose from "mongoose";

//using google for login and registration

const UserSchema=new mongoose.Schema({
    googleId:{
        type: String,
        required: true,
        unique: true,
        sparse: true,
        index: true
    },
    name:{
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
        index: true
    },
    avatar: {
        type: String,
        default:null,
    }
},
{timestamps: true}
)

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;