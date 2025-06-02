"use client";
import { User } from "@/models/User";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getUser = async () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await axios.get(`${API_URL}/Employees/Auth`, {
      withCredentials: true,
    });
    if (response.status !== 200) {
      throw new Error("Error fetching user");
    }
    return response.data as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUser,
  });
};

