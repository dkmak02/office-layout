"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getProjectInfo = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await axios.get(`${API_URL}/Projects`, {
        withCredentials: true,
      });
      if (response.status !== 200) {
        throw new Error("Error fetching project info");
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching project info:", error);
      throw error;
    }
  };
  
export const useProjectInfo = () => {
    return useQuery({
      queryKey: ["project-info"],
      queryFn: getProjectInfo,
    });
  };