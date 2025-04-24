import { Card } from "antd";
import React, { useState } from "react";
import { Project } from "@/app/models/projectModel";

interface ProjectCardProps {
  project: Project;
  choosenProjects: string[];
  onSelect: (code: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  choosenProjects,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isSelected = choosenProjects.includes(project.code);

  return (
    <Card
      key={project.code}
      onClick={() => onSelect(project.code)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        margin: 8,
        padding: 5,
        background: "#ffffff",
        cursor: "pointer",
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: isSelected
          ? project.color
          : isHovered
          ? "#ddd"
          : "#f0f0f0",
        boxShadow: isSelected
          ? `0 0 8px ${project.color}33`
          : isHovered
          ? "0 2px 8px rgba(0,0,0,0.05)"
          : "none",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}
      styles={{
        body: {
          padding: 0,
          margin: 0,
        },
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: project.color || "#aaa",
              borderRadius: 2,
              marginRight: 8,
            }}
          />
          <span style={{ fontWeight: 600, color: "#333" }}>{project.name}</span>
        </div>

        <span style={{ fontSize: 14, color: "#555" }}>
          {project.taken}/{project.total}
        </span>
      </div>
    </Card>
  );
};

export default ProjectCard;
