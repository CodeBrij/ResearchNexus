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
  onlineUsers: [], // list of online users

  checkAuth: async () => {
    try {
      // checks for the user is logged in or not
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data }); // gets the response from backend - stores it in authUser
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
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success("Account created successfully");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in signup: ", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false }); 
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      set({ authUser: null }); // setting authUser as null - on loggging out 
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("Error in logout: ", error);
      toast.error(error.response.data.message);
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

    } catch (error) {
      console.log("Error in login: ", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in updateProfile: ", error);

      // Handle error properly if the response is undefined
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
