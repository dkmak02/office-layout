"use client";
import { Reservation } from "@/app/models/deskModel";
import React, { createContext, useState, useContext, ReactNode } from "react";
  import dayjs from "dayjs";
  import useAuth from "../api/auth";
  interface AppDataContextType {
    selectedEmployees: number[];
    setSelectedEmployees: React.Dispatch<React.SetStateAction<number[]>>;
    choosenProjects: string[];
    setChoosenProjects: React.Dispatch<React.SetStateAction<string[]>>;
    currentReservations: Reservation[];
    setCurrentReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
    selectedDate: string;
    setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  }

  const AppDataContext = createContext<AppDataContextType | undefined>(
    undefined
  );

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
    const { data: user, isError, isLoading, isFetching } = useAuth();
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [choosenProjects, setChoosenProjects] = useState<string[]>([]);
    const [currentReservations, setCurrentReservations] = useState<
      Reservation[]
    >([]);
    const [selectedDate, setSelectedDate] = useState<string>(formattedDate);
    if (isError) {
      console.error("Error fetching user data");
      return <div>Error fetching user data</div>;
    }
    if (isLoading || isFetching) {
      return <div>Loading...</div>;
    }
    return (
      <AppDataContext.Provider
        value={{
          selectedEmployees,
          setSelectedEmployees,
          choosenProjects,
          setChoosenProjects,
          currentReservations,
          setCurrentReservations,
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
