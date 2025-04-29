"use client";
import useUser from "../util/api/UserApi";
import ProjectInfo from "../pages/ProjectInfo";
export default function Home() {
    const { data: userData } = useUser();
    if (!userData) return null;
    if (!userData.isAdmin) {
      return <div>Access Denied</div>;
    }
  return <ProjectInfo />;
}
