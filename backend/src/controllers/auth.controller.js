import User from "../models/user.model";
import bcrypt from "bcrypt";
import { generateTokens } from "../lib/utils.js";
import cloudinary from "cloudinary";

export const signup = async (req, res) => {
    const { name, email, password, profilePic, role, areaofexpertise, affiliation, linkedin, access } = req.body;
    try {
        if(!name || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }

        const user = await User.findOne({email});
        if(user) {
            return res.status(400).json({message: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profilePic,
            role,
            areaofexpertise,
            affiliation,
            linkedin,
            access
        });

        if (newUser) {
            //generate jwt token
            generateTokens(newUser._id, res);
      
            await newUser.save();
      
            res.status(201).json({
              _id: newUser._id,
              fullName: newUser.fullName,
              email: newUser.email,
              profilePic: newUser.profilePic,
            });
          } else {
            res.status(400).json({ message: "Invalid user data" });
          }
    } catch (error) {
        console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server ERROR!!" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if(!email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message: "User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        //generate jwt token
        generateTokens(user._id, res);
      
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server ERROR!!" });
    }
}

export const logout = (req, res) => {
    try {
      // deleting cookie - by making age of cookie as 0
      res.cookie("jwt", "", { maxAge: 0 });
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.log("Error in Logout Controller: ", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
export const updateProfile = async (req, res) => {
    const { name, email, password, profilePic, role, areaofexpertise, affiliation, linkedin, access } = req.body;
    try {
        if(!name || !email || !password || !role || !areaofexpertise || !affiliation || !linkedin || !access) {
            return res.status(400).json({message: "All fields are required"});
        }

        const UserId = req.user._id;

        const uploadProfilePic = await cloudinary.uploader.upload(profilePic)
        if(!uploadProfilePic) {
            return res.status(400).json({message: "Error uploading profile picture"});
        }

        const user = await User.findByIdAndUpdate(UserId, {
            name,
            email,
            password,
            profilePic: uploadProfilePic.url,
            role,
            areaofexpertise,
            affiliation,
            linkedin,
            access
        }, {
            new: true
        });

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });
    }
catch (error) {
    console.log("Error in updateProfile Controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
}
}

