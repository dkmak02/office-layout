import { Modal, List, Typography, Button, Select, message, Spin } from "antd";
import { useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import useProjects from "../util/api/ProjectApi";
import useDesks from "../util/api/DesksApi";
import { MulipleFormAssigmentProps } from "@/app/models/componentsModels";
import { MultipleDeskReservation } from "../models/deskModel";
import { Project } from "../models/projectModel";
const MultipleFormAssigment = ({
  selectedDesks,
  showMultipleFormModal,
  setShowMultipleFormModal,
  selectedFloor,
}: MulipleFormAssigmentProps) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: projects, changeProjectAsync } = useProjects(selectedFloor);
  const { changeDeskTypeAsync } = useDesks(selectedFloor);
  const multipleProjectChange = (value: string) => {
    setSelectedProject(value);
  };
  const handleMultipleDeskProjectChange = async (
    desks: MultipleDeskReservation[],
    project: string
  ) => {
    const projectId = projects?.find((p: Project) => p.code === project)?.id;
    const deskType = projectId ? "Project" : "Hotdesk";
    for (let deskId of desks) {
      changeDeskTypeAsync({
        deskId: deskId.id,
        deskType: deskType,
      }).then(() => {
        if (projectId) {
          return changeProjectAsync({
            deskId: deskId.id,
            projectId: projectId,
          });
        }
      });
    }
  };
  const handleMultipleProjectChange = async () => {
    if (!selectedDesks.length || !selectedProject) {
      message.error("Wybierz biurka i projekt");
      return;
    }
    setIsLoading(true);
    try {
      await handleMultipleDeskProjectChange(selectedDesks, selectedProject);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error:", error);
    }

    setSelectedProject(null);
    setShowMultipleFormModal(false);
  };
  if (isLoading) {
    <Spin indicator={<LoadingOutlined spin />} size="large" />;
  }
  return (
    <Modal
      title={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>Przypisanie projektu</div>
          <div style={{ paddingRight: 25 }}>
            Wybrane biurka: {selectedDesks.length}
          </div>
        </div>
      }
      open={showMultipleFormModal}
      onCancel={() => setShowMultipleFormModal(false)}
      okButtonProps={{ style: { display: "none" } }}
      cancelButtonProps={{ style: { display: "none" } }}
    >
      <List
        dataSource={selectedDesks}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text>{item.name}</Typography.Text>
          </List.Item>
        )}
        style={{
          maxHeight: 300,
          overflowY: "auto",
        }}
      />
      <Select
        showSearch
        placeholder="Wybierz projekt"
        value={selectedProject}
        optionFilterProp="label"
        onChange={multipleProjectChange}
        options={(projects || []).map((project) => ({
          label: project.name,
          value: project.code,
        }))}
        style={{ width: "100%", marginTop: 16 }}
      />
      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <Button
          color="primary"
          variant="outlined"
          onClick={handleMultipleProjectChange}
        >
          Zatwierdź
        </Button>
        <Button
          danger
          onClick={() => {
            setShowMultipleFormModal(false);
            setSelectedProject(null);
          }}
        >
          Anuluj
        </Button>
      </div>
    </Modal>
  );
};
export default MultipleFormAssigment;
