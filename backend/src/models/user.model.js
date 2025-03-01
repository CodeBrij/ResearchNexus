import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        default: "",
      },
    role: {
        type: String,
    },
    areaofexpertise: {
        type: String,
        required: true,
    },
    affiliation:{
        type: String,
        default: "VESIT"
    },
    linkedin:{
        type: String,
        default: ""
    },
    access:{
        type: Boolean,
        required: true
    }
});

const User = mongoose.model("User", userSchema);
export default User;