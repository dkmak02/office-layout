"use client";
import { useState } from "react";
import Selecto from "react-selecto";
import { Modal, Select } from "antd";
import { useTranslations } from "next-intl";
import { useProjectInfo } from "@/api/queries/project/project-api-page";
import { Project } from "@/models/Project";
import { useUser } from "@/api/queries/auth/get-user";
import { useAssignDesksToProject } from "@/api/mutations/desk/assign-desks-to-project";
import { useSearchParams } from "next/navigation";
import { message } from "antd";

const DeskSelector = () => {
  const [selectedElements, setSelectedElements] = useState<{ id: number; name: string | null }[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | string | undefined>();
  const { data: projects } = useProjectInfo();
  const { mutateAsync: assignDesksToProject } = useAssignDesksToProject();
  const { data: user } = useUser();
  const searchParams = useSearchParams();
  const floor = searchParams.get("floor");
  const date = searchParams.get("date");
  const t = useTranslations("ReservationModal");

  const isAdmin = user?.isAdmin || false;
  const isModerator = user?.isModerator || false;
  const canManageDesks = isAdmin || isModerator;
  if(!canManageDesks) {
    return null;
  }
  const handleSelect = (e: any) => {
    const added = e.added.map((el: any) => ({
      id: Number(el.id),
      name: el.getAttribute("name") || null,
    }));
    const removed = e.removed.map((el: any) => Number(el.id));
    
    const newSelection = [
      ...selectedElements.filter((el) => !removed.includes(el.id)),
      ...added,
    ];
    
    setSelectedElements(newSelection);
  };

  const handleSelectEnd = (e: any) => {
    if (selectedElements.length > 0) {
      setIsModalVisible(true);
    }
  };

  const handleModalOk = async () => {
    if(!selectedProjectId || selectedElements.length === 0) {
      message.error(t("selectPRODESK"));
      return;
    }

    try {
      const failedDesks = await assignDesksToProject({
        projectId: selectedProjectId as number,
        deskIds: selectedElements.map((desk) => desk.id),
        floor: floor as string,
        date: date as string
      });
      if(failedDesks && failedDesks.length > 0) {
        const failedDeskNames = failedDesks.join(", ");
        message.error(t("failedToAssignDesks", { desks: failedDeskNames }));
      } else {
        message.success(t("successfullyAssignedDesks"));
      }
      
      setIsModalVisible(false);
      setSelectedElements([]);
      setSelectedProjectId(undefined);
    } catch (error) {
      message.error(t("operationFailed"));
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedElements([]);
    setSelectedProjectId(undefined);
  };

  // Get all projects including Hotdesk for admin/moderator
  const availableProjects = projects?.filter((project: Project) => 
    canManageDesks ? true : project.code !== "Hotdesk"
  ) || [];

  return (
    <>
      <Selecto
        dragContainer={".selectable-container"}
        selectableTargets={[".desk"]}
        hitRate={100}
        ratio={0}
        selectByClick={false}
        onSelect={handleSelect}
        onSelectEnd={handleSelectEnd}
      />
      <Modal
        title={t("selectedDesks")}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t("confirm")}
        cancelText={t("cancel")}
        width={600}
        style={{
          padding: '16px'
        }}
      >
        <div className="space-y-4">
          {/* Project Selection Section */}
          <div>
            <div className="mb-2">
              <span className="font-medium">{t("projectAssigned")}</span>
            </div>
            <Select
              showSearch
              placeholder={t("chooseProject")}
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              optionFilterProp="label"
              options={availableProjects.map((project: Project) => ({
                label: project.name,
                value: project.id,
              }))}
              style={{ width: "100%" }}
              className="w-full [&_.ant-select-selector]:!text-black [&_.ant-select-selector]:!bg-gray-100 [&_.ant-select-selector]:!opacity-100"
            />
          </div>

          {/* Selected Desks Section */}
          {selectedElements.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="mb-2">
                <span className="font-medium">{t("selectedDesks")}</span>
              </div>
              <div 
                className="space-y-2 overflow-y-auto"
                style={{ 
                  maxHeight: '200px',
                  paddingRight: '8px'
                }}
              >
                {selectedElements.map((desk) => (
                  <div 
                    key={desk.id} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">{desk.name}</span>
                    <span className="text-gray-500">ID: {desk.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default DeskSelector; 