"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface FillterContextType {
  selectedEmployees: number[];
  setSelectedEmployees: React.Dispatch<React.SetStateAction<number[]>>;
  choosenProject: string;
  setChoosenProject: React.Dispatch<React.SetStateAction<string>>;
}

const FillterContext = createContext<FillterContextType | undefined>(undefined);

interface MarkerProviderProps {
  children: ReactNode;
}

export const FillterProvider: React.FC<MarkerProviderProps> = ({ children }) => {
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [choosenProject, setChoosenProject] = useState<string>("");

  return (
    <FillterContext.Provider
      value={{
        selectedEmployees,
        setSelectedEmployees,
        choosenProject,
        setChoosenProject,
      }}
    >
      {children}
    </FillterContext.Provider>
  );
};

export const useFillter = (): FillterContextType => {
  const context = useContext(FillterContext);
  if (!context) {
    throw new Error("useMarkers must be used within a MarkerProvider");
  }
  return context;
};
