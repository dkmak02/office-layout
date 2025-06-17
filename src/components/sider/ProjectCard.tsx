import { Project } from "@/models/Project";
import { Card } from "antd";
import React, { useState } from "react";


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
      data-testid={`project-card-${project.code}`}
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
        textOverflow: "ellipsis",
        overflow: "hidden",
      }}
      styles={{
        body: {
          padding: 0,
          margin: 0,
        },
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex items-center overflow-hidden"
          style={{ minWidth: 0 }}
        >
          <div
            data-testid={`project-color-${project.code}`}
            style={{
              width: 12,
              height: 12,
              backgroundColor: project.color || "#aaa",
              borderRadius: 2,
              marginRight: 8,
              flexShrink: 0,
            }}
          />
          <span
            data-testid={`project-name-${project.code}`}
            style={{
              fontWeight: 500,
              color: "#333",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "180px",
            }}
          >
            {project.name}
          </span>
        </div>

        <span
          data-testid={`project-count-${project.code}`}
          style={{
            fontSize: 14,
            color: "#555",
            marginLeft: 8,
            flexShrink: 0,
          }}
        >
          {project.taken}/{project.total}
        </span>
      </div>
    </Card>
  );
};

export default ProjectCard;
