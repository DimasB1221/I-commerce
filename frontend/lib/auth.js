import api from "./api";

export const authService = {
  // Login function
  async login(email, password) {
    try {
      const response = await api.post("auth/login", {
        email,
        password,
      });

      // Assuming server returns: { token: "...", user: {...} }
      const { token, name } = response.data;

      // Save token to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        if (name) {
          localStorage.setItem("name", JSON.stringify(name));
        }
      }
      console.log(localStorage.getItem("token", response.data.token));

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status,
      };
    }
  },

  // Logout function
  async logout() {
    try {
      // Optional: Call logout endpoint on server
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
      }
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Get current user
  getCurrentUser() {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("name");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Login with Google (social auth)
  async loginWithGoogle() {
    try {
      // Redirect to Google OAuth or use Google Sign-In SDK
      // This is a placeholder - implement based on your backend
      const response = await api.get("/api/auth/google");
      window.location.href = response.data.authUrl;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
