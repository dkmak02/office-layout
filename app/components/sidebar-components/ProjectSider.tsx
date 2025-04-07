import React, { useState } from "react";
import { Layout, List, Card, theme } from "antd";
const { Sider } = Layout;
import useProjects from "@/app/util/api/ProjectApi";
import { ProjectSiderProps } from "@/app/models/componentsModels";
import { Project, SelectedProject } from "@/app/models/projectModel";

const ProjectSider: React.FC<ProjectSiderProps> = ({
  selectedFloor,
  selectedProject,
  handleSelectedProjectChange,
  darkenColor,
}) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { data: projects, isLoading } = useProjects(selectedFloor);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!projects) {
    return <div>No projects available</div>;
  }

  const generateProjectCard = (
    project: Project,
    selectedProject: SelectedProject,
    handleSelectedProjectChange: (project: Project) => void
  ) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const isSelected = selectedProject === project.code;
    const backgroundColor = isHovered
      ? darkenColor(project.color || "#e0e0e0", 0.1)
      : isSelected
      ? project.color
      : project.color;

    const cardStyles = {
      marginTop: 16,
      marginBottom: 16,
      padding: 8,
      background: backgroundColor,
      color: "white",
      fontWeight: "bold",
      borderRadius: "8px",
      cursor: "pointer",
      border: isSelected ? "3px solid #141301" : "none",
      opacity: isHovered ? "1.0" : "0.9",
      boxShadow: isSelected ? "0 0 8px 1px rgba(255, 255, 255, 0.8)" : "none",
      transition: "background 0.3s ease, opacity 0.3s ease",
    };

    const headerStyles = {
      margin: 0,
      padding: 0,
      color: "white",
      fontWeight: "bold",
    };

    const bodyStyles = {
      padding: 0,
      margin: 0,
    };

    return (
      <Card
        key={project.code}
        style={cardStyles}
        onClick={() => handleSelectedProjectChange(project)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        styles={{ body: bodyStyles }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={headerStyles}>{project.name}</div>
          <div style={{ paddingRight: 5 }}>
            {project.taken}/{project.total}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Sider
      width={250}
      style={{
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
        margin: "16px 0",
        marginLeft: 16,
        maxHeight: "calc(100vh - 150px)",
        overflowY: "auto",
        padding: 8,
      }}
    >
      <List
        dataSource={projects}
        renderItem={(item: Project) =>
          generateProjectCard(
            item,
            selectedProject,
            handleSelectedProjectChange
          )
        }
      />
    </Sider>
  );
};

export default ProjectSider;
