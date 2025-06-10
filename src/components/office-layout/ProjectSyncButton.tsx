"use client";
import React from "react";
import { Button, message } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { useUser } from "@/api/queries/auth/get-user";
import { useSyncProjects } from "@/api/mutations/project/sync-projects";

const ProjectSyncButton: React.FC = () => {
  const t = useTranslations("HomePage");
  const { data: user } = useUser();
  
  // Get floor and date from URL params for cache invalidation
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const floor = pathname.split("/").pop() === "floor-7" ? "Floor 7" : "Floor 8";
  const date = searchParams.get("date") ? searchParams.get("date")! : dayjs().format("YYYY-MM-DD");
  const formattedDate = dayjs(date).format("YYYY-MM-DDTHH:mm:ss");
  
  const syncProjectsMutation = useSyncProjects(floor, formattedDate);

  // Only show button to admins (not moderators)
  const isAdmin = user?.isAdmin;

  if (!isAdmin) {
    return null;
  }

  const handleSync = async () => {
    try {
      await syncProjectsMutation.mutateAsync();
      message.success(t("syncSuccess"));
    } catch (error: any) {
      console.error("Error syncing projects:", error);
      message.error(t("syncError"));
    }
  };

  return (
    <Button
      type="primary"
      icon={<SyncOutlined />}
      onClick={handleSync}
      loading={syncProjectsMutation.isPending}
      style={{ whiteSpace: "nowrap" }}
    >
      {t("sync")}
    </Button>
  );
};

export default ProjectSyncButton; 