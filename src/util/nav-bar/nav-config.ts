export type UserRole = "admin" | "moderator" | "employee";

export const navTabs = {
  moderator: [
    { key: "floor-7", label: "Floor 7", href: "/office/floor-7" },
    { key: "floor-8", label: "Floor 8", href: "/office/floor-8" },
    { key: "employees", label: "Employees", href: "/employees" },
    { key: "project-info", label: "Project Info", href: "/project-info" },
  ],
  employee: [
    { key: "floor7", label: "Floor 7", href: "/office/floor-7" },
    { key: "floor8", label: "Floor 8", href: "/office/floor-8" },
  ],
};
