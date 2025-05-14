"use client";
import UnassignedEmployees from "../pages/UnassignedEmployees";
import useUser from "../util/api/UserApi";
import { useDataContext } from "../util/providers/AppDataContext";
import { useEffect } from "react";
export default function Home() {
  const { data: userData } = useUser();
  const { setChoosenProjects, setSelectedEmployees } = useDataContext();
  useEffect(() => {
    setChoosenProjects([]);
    setSelectedEmployees([]);
  }, [setChoosenProjects, setSelectedEmployees]);
  if (!userData) return null;
  if (!userData.isAdmin) {
    return <div>Access Denied</div>;
  }
  return <UnassignedEmployees />;
}
