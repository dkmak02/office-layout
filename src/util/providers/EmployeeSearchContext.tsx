"use client";

import { createContext, useContext, useState } from "react";

const EmployeeSearchContext = createContext<{
    selectedEmployees: number[];
    setSelectedEmployees: (employees: number[] | ((prev: number[]) => number[])) => void;
    selectedProjects: string[];
    setSelectedProjects: (projects: string[] | ((prev: string[]) => string[])) => void;
}>({
    selectedEmployees: [],
    setSelectedEmployees: () => {},
    selectedProjects: [],
    setSelectedProjects: () => {},
});

export const useEmployeeSearchContext = () => {
    const context = useContext(EmployeeSearchContext);
    if (!context) {
        throw new Error("useEmployeeSearchContext must be used within a EmployeeSearchContext");
    }
    return context;
};

export const EmployeeSearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

    return (    
        <EmployeeSearchContext.Provider value={{ selectedEmployees, setSelectedEmployees, selectedProjects, setSelectedProjects }}>
            {children}
        </EmployeeSearchContext.Provider>
    );
};




