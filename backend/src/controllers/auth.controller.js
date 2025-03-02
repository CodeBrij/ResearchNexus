import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateTokens } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { name, email, password} = req.body;
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
        });

        if (newUser) {
            //generate jwt token
            generateTokens(newUser._id, res);
      
            await newUser.save();
            res.status(201).json({
              _id: newUser._id,
              name: newUser.name,
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
    try {
        const { name, email, role, areaofexpertise, affiliation, linkedin, access, profilePic } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if(!name || !email || !role || !areaofexpertise || !affiliation || !linkedin) {
            return res.status(400).json({message: "Please fill all required fields"});
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({message: "Email is already taken"});
        }

        // Handle profile picture upload if provided
        let profilePicUrl = undefined;
        if (profilePic && profilePic.startsWith('data:image')) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(profilePic, {
                    folder: 'profile_pics',
                    use_filename: true,
                    unique_filename: true,
                });
                profilePicUrl = uploadResponse.secure_url;
            } catch (error) {
                console.error("Error uploading profile picture:", error);
                return res.status(400).json({message: "Failed to upload profile picture"});
            }
        }

        // Update user
        const updateData = {
            name,
            email,
            role,
            areaofexpertise,
            affiliation,
            linkedin,
            access: access || false
        };

        // Only add profilePic to update if we got a new one
        if (profilePicUrl) {
            updateData.profilePic = profilePicUrl;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error in updateProfile Controller:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

export const checkAuth = async(req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in checkAuth controller: ", error);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message 
    });
  }
};
