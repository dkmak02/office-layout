"use client";
import { Reservation } from "@/app/models/deskModel";
import React, { createContext, useState, useContext, ReactNode } from "react";
  import dayjs from "dayjs";
interface AppDataContextType {
  selectedEmployees: number[];
  setSelectedEmployees: React.Dispatch<React.SetStateAction<number[]>>;
  choosenProjects: string[];
  setChoosenProjects: React.Dispatch<React.SetStateAction<string[]>>;
  currentReservations: Reservation[];
  setCurrentReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  selectedFloor: string;
  setSelectedFloor: React.Dispatch<React.SetStateAction<string>>;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({
  children,
}) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const formattedDate = dayjs(currentDate)
    .add(1, "hour")
    .format("YYYY-MM-DDTHH:mm:ss");

  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [choosenProjects, setChoosenProjects] = useState<string[]>([]);
  const [currentReservations, setCurrentReservations] = useState<Reservation[]>(
    []
  );
  const [selectedFloor, setSelectedFloor] = useState<string>("Floor 7");
  const [selectedDate, setSelectedDate] = useState<string>(formattedDate);

  return (
    <AppDataContext.Provider
      value={{
        selectedEmployees,
        setSelectedEmployees,
        choosenProjects,
        setChoosenProjects,
        currentReservations,
        setCurrentReservations,
        selectedFloor,
        setSelectedFloor,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useDataContext = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppContext must be used within a context provider");
  }
  return context;
};
