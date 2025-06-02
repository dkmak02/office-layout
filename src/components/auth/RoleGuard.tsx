"use client";
import { useUser } from "@/api/queries/auth/get-user";
import { Spin, Alert } from "antd";

type AllowedRole = "admin" | "moderator";

function hasRole(user: any, allowedRoles: AllowedRole[]) {
  if (allowedRoles.includes("admin") && user.isAdmin) return true;
  if (allowedRoles.includes("moderator") && user.isModerator) return true;
  return false;
}

export default function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: AllowedRole[];
}) {
  const { data: user, isLoading, isError } = useUser();

  if (isLoading) {
    return <Spin tip="Checking authentication..." />;
  }

  if (isError || !user) {
    return (
      <Alert
        message="Not authorized"
        description="You must be authenticated to access this application."
        type="error"
        showIcon
        style={{ margin: 40 }}
      />
    );
  }
  if (!hasRole(user, allowedRoles)) {
    return (
      <Alert
        message="Access denied"
        description="You do not have permission to view this page."
        type="error"
        showIcon
        style={{ margin: 40 }}
      />
    );
  }

  return <>{children}</>;
}