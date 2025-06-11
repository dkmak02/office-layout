"use client";
import useProjects from "@/api/queries/project/project-api-floor-date";
import ProjectCard from "./ProjectCard";
import { usePathname,useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { useEmployeeSearchContext } from "@/util/providers/EmployeeSearchContext";
const Projects = () => {
    const { selectedProjects, setSelectedProjects } = useEmployeeSearchContext();
    const pathname = usePathname();
    const floor = pathname.split("/").pop() === "floor-7" ? "Floor 7" : "Floor 8";
    const searchParams = useSearchParams();
    const date = searchParams.get("date") ? searchParams.get("date") : dayjs().format("YYYY-MM-DD");
    const formattedDate = dayjs(date)
        .format("YYYY-MM-DDTHH:mm:ss");
    const projects = useProjects(floor, formattedDate).data || [];
    const handleSelect = (code: string) => {
        setSelectedProjects((prev: string[]) =>
        prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
        );
    };
    
    return (
        <div data-testid="projects-list">
        {projects.filter((project) => project.visibility).map((project) => (
            <ProjectCard
            key={project.code}
            project={project}
            choosenProjects={selectedProjects}
            onSelect={handleSelect}
            />
        ))}
        </div>
    );
    }
export default Projects;