import { Modal, List, Typography, Button, Select, message, Spin } from "antd";
import { useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import useProjects from "../util/api/ProjectApi";
import useDesks from "../util/api/DesksApi";
import { MulipleFormAssigmentProps } from "@/app/models/componentsModels";
import { MultipleDeskReservation } from "../models/deskModel";
import { Project } from "../models/projectModel";
import { useDataContext } from "../util/providers/AppDataContext";
const MultipleFormAssigment = ({
  selectedDesks,
  showMultipleFormModal,
  setShowMultipleFormModal,
  selectedFloor,
}: MulipleFormAssigmentProps) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: projects, changeProjectAsync } = useProjects(selectedFloor);
  const { selectedDate } = useDataContext();
  console.log(selectedFloor, selectedDate);
  const { changeDeskTypeAsync } = useDesks(selectedFloor, selectedDate);
  const multipleProjectChange = (value: string) => {
    setSelectedProject(value);
  };
  const handleMultipleDeskProjectChange = async (
    desks: MultipleDeskReservation[],
    project: string
  ) => {
    const projectId = projects?.find((p: Project) => p.code === project)?.id;
    const deskType = projectId ? "Project" : "Hotdesk";
    console.log(desks, project);
    await Promise.allSettled(
      desks.map(async (deskId) => {
        try {
          await changeDeskTypeAsync({
            deskId: deskId.id,
            deskType: deskType,
          });

          if (projectId) {
            await changeProjectAsync({
              deskId: deskId.id,
              projectId: projectId,
            });
          }
        } catch (error) {
          message.error(
            `Nie można przypisać projektu do biurka ${deskId.name} (biurko ma rezerwację).`
          );
        }
      })
    );
  };
  const handleMultipleProjectChange = async () => {
    if (!selectedDesks.length || !selectedProject) {
      message.error("Wybierz biurka i projekt");
      return;
    }
    setIsLoading(true);
    try {
      await handleMultipleDeskProjectChange(selectedDesks, selectedProject);
    } catch (error) {
      console.error("Error updating desks:", error);
    } finally {
      setIsLoading(false);
    }

    setSelectedProject(null);
    setShowMultipleFormModal(false);
  };

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
      <Spin
        spinning={isLoading}
        indicator={<LoadingOutlined spin />}
        style={{ width: "100%" }}
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
            disabled={isLoading}
          >
            Zatwierdź
          </Button>
          <Button
            danger
            onClick={() => {
              setShowMultipleFormModal(false);
              setSelectedProject(null);
            }}
            disabled={isLoading}
          >
            Anuluj
          </Button>
        </div>
      </Spin>
    </Modal>
  );
};
export default MultipleFormAssigment;
