import React from "react";
import { Layout, List, theme } from "antd";
import { ProjectSiderProps } from "@/app/models/componentsModels";
import { Project } from "@/app/models/projectModel";
import { useDataContext } from "@/app/util/providers/AppDataContext";
import useProjects from "@/app/util/api/ProjectApi";
import ProjectCard from "./ProjectCard";

const { Sider } = Layout;

const ProjectSider: React.FC<ProjectSiderProps> = ({ selectedFloor }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { setChoosenProjects, choosenProjects, selectedDate } =
    useDataContext();
  const { data: projects } = useProjects(selectedFloor, selectedDate);

  const handleSelectedProjectChange = (projectCode: string) => {
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
        renderItem={(project: Project) =>
          project.visibility && (
            <ProjectCard
              key={project.code}
              project={project}
              choosenProjects={choosenProjects}
              onSelect={handleSelectedProjectChange}
            />
          )
        }
      />
    </Sider>
  );
};

export default ProjectSider;
