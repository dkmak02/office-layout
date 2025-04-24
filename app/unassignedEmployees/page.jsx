"use client";
import UnassignedEmployees from "../pages/UnassignedEmployees";
import useUser from "../util/api/UserApi";
export default function Home() {
    const { data: userData } = useUser();
    if (!userData) return null;
    if (!userData.isAdmin) {
      return <div>Access Denied</div>;
    }
  return <UnassignedEmployees />;
}
