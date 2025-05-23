"use client";
import useProjects from "@/api/project/project-api";
import ProjectCard from "./ProjectCard";
import { useState } from "react";
import { usePathname,useSearchParams } from "next/navigation";
import dayjs from "dayjs";
const Projects = () => {
    const pathname = usePathname();
    const floor = pathname.split("/").pop() === "floor-7" ? "Floor 7" : "Floor 8";
    const searchParams = useSearchParams();
    const date = searchParams.get("date");
    const formattedDate = dayjs(date)
        .add(1, "hour")
        .format("YYYY-MM-DDTHH:mm:ss");
    const [choosenProjects, setChoosenProjects] = useState<string[]>([]);
    const projects = useProjects(floor, formattedDate).data || [];
    const handleSelect = (code: string) => {
        setChoosenProjects((prev) =>
        prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
        );
    };
    
    return (
        <div>
        {projects.map((project) => (
            <ProjectCard
            key={project.code}
            project={project}
            choosenProjects={choosenProjects}
            onSelect={handleSelect}
            />
        ))}
        </div>
    );
    }
export default Projects;