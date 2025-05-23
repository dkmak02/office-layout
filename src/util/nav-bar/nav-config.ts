export type UserRole = "admin" | "moderator" | "employee";

export const navTabs = {
  admin: [
    { key: "floor7", label: "Floor 7", href: "/dashboard" },
    { key: "floor8", label: "Floor 8", href: "/users" },
    { key: "employees", label: "Employeees", href: "/settings" },
    { key: "project-info", label: "Project Info", href: "/settings" },
  ],
  moderator: [
    { key: "dashboard", label: "Dashboard", href: "/dashboard" },
    { key: "team", label: "My Team", href: "/team" },
  ],
  employee: [{ key: "dashboard", label: "Dashboard", href: "/dashboard" }],
} as const;
