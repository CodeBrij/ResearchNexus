import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Briefcase, Globe, Linkedin, Shield, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import Header from "../components/Header";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    areaofexpertise: "",
    affiliation: "",
    linkedin: "",
    access: false,
  });
  const [profilePic, setProfilePic] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (authUser) {
      setFormData({
        name: authUser.name || "",
        email: authUser.email || "",
        role: authUser.role || "",
        areaofexpertise: authUser.areaofexpertise || "",
        affiliation: authUser.affiliation || "",
        linkedin: authUser.linkedin || "",
        access: authUser.access || false,
      });
      setPreviewUrl(authUser.profilePic || "");
    }
  }, [authUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfilePic("");
    setPreviewUrl(authUser?.profilePic || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    const dataToUpdate = {
      ...formData,
      profilePic: profilePic || undefined
    };
    
    const success = await updateProfile(dataToUpdate);
    if (success) {
      toast.success("Profile updated successfully!");
      setProfilePic(""); // Reset the profile pic state after successful update
    }
  };

  return (
    <>
    <div className="w-full flex justify-center bg-background drop-shadow-2xl">
        <Header />
    </div>
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 pt-20 pb-10">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-gray-400">Manage your account information</p>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/30 shadow-xl">
                <img
                  src={previewUrl || "/default-avatar.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <label 
                htmlFor="profile-pic"
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full cursor-pointer transition-all duration-200 shadow-lg"
              >
                <Camera className="w-5 h-5 text-white" />
              </label>
              
              {previewUrl && previewUrl !== authUser?.profilePic && (
                <button
                  onClick={removeImage}
                  className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 p-2 rounded-full transition-all duration-200 shadow-lg"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                id="profile-pic"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-gray-400 mt-2 text-sm">
              Click the camera icon to update your photo
            </p>
          </div>

          <div className="space-y-6">
            {/* Name Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name
                </span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered bg-gray-700/50 border-gray-600 text-white w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered bg-gray-700/50 border-gray-600 text-white w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Role Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Role
                </span>
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input input-bordered bg-gray-700/50 border-gray-600 text-white w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your role"
              />
            </div>

            {/* Area of Expertise Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Area of Expertise
                </span>
              </label>
              <input
                type="text"
                name="areaofexpertise"
                value={formData.areaofexpertise}
                onChange={handleChange}
                className="input input-bordered bg-gray-700/50 border-gray-600 text-white w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your area of expertise"
              />
            </div>

            {/* Affiliation Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Affiliation
                </span>
              </label>
              <input
                type="text"
                name="affiliation"
                value={formData.affiliation}
                onChange={handleChange}
                className="input input-bordered bg-gray-700/50 border-gray-600 text-white w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your affiliation"
              />
            </div>

            {/* LinkedIn Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300 flex items-center gap-2">
                  <Linkedin className="w-4 h-4" /> LinkedIn Profile
                </span>
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="input input-bordered bg-gray-700/50 border-gray-600 text-white w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your LinkedIn profile URL"
              />
            </div>

            {/* Access Toggle */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="access"
                  checked={formData.access}
                  onChange={handleChange}
                  className="toggle toggle-primary"
                />
                <span className="label-text text-gray-300">Enable Special Access</span>
              </label>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isUpdatingProfile}
              className="btn btn-primary w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isUpdatingProfile ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfilePage;
