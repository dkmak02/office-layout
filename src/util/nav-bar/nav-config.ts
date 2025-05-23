export type UserRole = "admin" | "moderator" | "employee";
export const navTabs = {
  moderator: [
    { key: "floor-7", label: "floor7", href: "/office/floor-7" },
    { key: "floor-8", label: "floor8", href: "/office/floor-8" },
    { key: "employees", label: "employees", href: "/employees" },
    { key: "project-info", label: "projects", href: "/project-info" },
  ],
  employee: [
    { key: "floor7", label: "Floor 7", href: "/office/floor-7" },
    { key: "floor8", label: "Floor 8", href: "/office/floor-8" },
  ],
};
