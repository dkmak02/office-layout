"use client";
import { useUser } from "@/api/queries/auth/get-user";
import { Spin, Alert } from "antd";

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useUser();
  if (isLoading) {
    return (
      <Spin
        tip="Checking authentication..."
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    );
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

  return <>{children}</>;
} 