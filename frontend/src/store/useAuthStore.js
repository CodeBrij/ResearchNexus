import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

// implementing zustand
// zustand works as state storing files which can be accessed anywhere - variables r defined directly with assigning values
// can be accessed in the same store using get and set using set

export const useAuthStore = create((set, get) => ({
  authUser: null, // storing user info
  isSigningUp: false, // for loading 
  isLoggingIn: false, // for loading
  isUpdatingProfile: false, // for loading
  isCheckingAuth: true, // for loading

  checkAuth: async () => {
    try {
      console.log("Checking auth...");
      const res = await axiosInstance.get("/auth/check");
      console.log("Auth check response:", res.data);
      if (res.data && res.data._id) {
        set({ authUser: res.data });
        console.log("Auth user set:", res.data);
      } else {
        set({ authUser: null });
        console.log("Auth user cleared - invalid response");
      }
    } catch (error) {
      console.log("Error in checkAuth: ", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      console.log("Signing up...");
      const res = await axiosInstance.post("/auth/signup", data);
      console.log("Signup response:", res.data);
      if (res.data && res.data._id) {
        set({ authUser: res.data });
        console.log("Auth user set after signup:", res.data);
        toast.success("Account created successfully");
        return true;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.log("Error in signup: ", error);
      toast.error(error.response?.data?.message || "Signup failed");
      return false;
    } finally {
      set({ isSigningUp: false }); 
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      console.log("Logging in...");
      const res = await axiosInstance.post("/auth/login", data);
      console.log("Login response:", res.data);
      if (res.data && res.data._id) {
        set({ authUser: res.data });
        console.log("Auth user set after login:", res.data);
        toast.success("Logged in successfully");
        return true;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.log("Error in login: ", error);
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      console.log("Logging out...");
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      console.log("Auth user cleared after logout");
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("Error in logout: ", error);
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (updatedData) => {
    try {
      set({ isUpdatingProfile: true });
      console.log("Updating profile with data:", updatedData);

      const response = await axiosInstance.patch("/auth/profile", updatedData);
      console.log("Profile update response:", response.data);

      if (response.data) {
        set({ authUser: response.data });
        toast.success("Profile updated successfully!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
