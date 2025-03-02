import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Briefcase, Globe, Linkedin, Shield } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
    role: authUser?.role || "",
    areaofexpertise: authUser?.areaofexpertise || "",
    affiliation: authUser?.affiliation || "",
    linkedin: authUser?.linkedin || "",
    access: authUser?.access || false,
  });
  
  const [selectedImg, setSelectedImg] = useState(authUser?.profilePic || "");
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImg(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const updatedData = { ...formData };

    if (imageFile) {
      const formDataImage = new FormData();
      formDataImage.append("profilePic", imageFile);

      // Assuming backend endpoint for image upload exists
      try {
        const response = await fetch("/upload/profile-pic", {
          method: "POST",
          body: formDataImage,
        });
        const data = await response.json();
        updatedData.profilePic = data.imageUrl; // Assuming API returns the image URL
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }

    updateProfile(updatedData);
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Edit your profile information</p>
          </div>

          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label htmlFor="avatar-upload" className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}>
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Editable Profile Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 flex items-center gap-2"><User className="w-4 h-4" /> Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="px-4 py-2 w-full bg-base-200 rounded-lg border" />
            </div>

            <div>
              <label className="text-sm text-zinc-400 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</label>
              <input type="email" name="email" value={formData.email} disabled className="px-4 py-2 w-full bg-base-200 rounded-lg border opacity-60 cursor-not-allowed" />
            </div>

            <div>
              <label className="text-sm text-zinc-400 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Role</label>
              <input type="text" name="role" value={formData.role} onChange={handleChange} className="px-4 py-2 w-full bg-base-200 rounded-lg border" />
            </div>

            <div>
              <label className="text-sm text-zinc-400 flex items-center gap-2"><Globe className="w-4 h-4" /> Area of Expertise</label>
              <input type="text" name="areaofexpertise" value={formData.areaofexpertise} onChange={handleChange} className="px-4 py-2 w-full bg-base-200 rounded-lg border" />
            </div>

            <div>
              <label className="text-sm text-zinc-400 flex items-center gap-2"><Globe className="w-4 h-4" /> Affiliation</label>
              <input type="text" name="affiliation" value={formData.affiliation} onChange={handleChange} className="px-4 py-2 w-full bg-base-200 rounded-lg border" />
            </div>

            <div>
              <label className="text-sm text-zinc-400 flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</label>
              <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="px-4 py-2 w-full bg-base-200 rounded-lg border" />
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Account Access</span>
              <input type="checkbox" name="access" checked={formData.access} onChange={handleChange} className="w-5 h-5" />
            </div>
          </div>

          {/* Save Button */}
          <div className="text-center">
            <button onClick={handleSave} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:bg-gray-500" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
