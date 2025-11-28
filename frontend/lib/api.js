import axios from "axios";
import { redirect } from "next/navigation";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.status?.message === 401 && typeof window !== undefined) {
      localStorage.removeItem("token");
      redirect("/login");
    }

    const customError = new Error(
      error.status?.message || error.message || "Request Failed"
    );

    customError.data = error.response?.data;
    customError.status = error.response?.status;

    customError.all = error;
    return Promise.reject(customError.data);
  }
);

export default api;
