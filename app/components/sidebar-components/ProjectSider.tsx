import React from "react";
import { Layout, List, theme } from "antd";
import { ProjectSiderProps } from "@/app/models/componentsModels";
import { Project } from "@/app/models/projectModel";
import { useDataContext } from "@/app/util/providers/AppDataContext";
import { useQueryClient } from "@tanstack/react-query";
import useProjects from "@/app/util/api/ProjectApi";
import ProjectCard from "./ProjectCard";

const { Sider } = Layout;

const ProjectSider: React.FC<ProjectSiderProps> = ({
  selectedFloor,
  darkenColor,
}) => {
  const queryClient = useQueryClient();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const {
    selectedEmployees,
    setChoosenProjects,
    choosenProjects,
    selectedDate,
  } = useDataContext();
  const { data: projects, isLoading } = useProjects(selectedFloor);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!projects) {
    return <div>No projects available</div>;
  }

  const handleSelectedProjectChange = (projectCode: string) => {
    // const newSelectedProject =
    //   projectCode === choosenProject ? "" : projectCode;
    if (choosenProjects.includes(projectCode)) {
      setChoosenProjects((prev) => prev.filter((code) => code !== projectCode));
    } else {
      setChoosenProjects((prev) => [...prev, projectCode]);
    }
  };

  return (
    <Sider
      width={300}
      style={{
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
        margin: "16px 0",
        marginLeft: 16,
        overflowY: "auto",
        padding: 8,
      }}
    >
      <List
        dataSource={projects}
        style={{ paddingBottom: 8 }}
        renderItem={(project: Project) => (
          <ProjectCard
            key={project.code}
            project={project}
            choosenProjects={choosenProjects}
            onSelect={handleSelectedProjectChange}
          />
        )}
      />
    </Sider>
  );
};

export default ProjectSider;
