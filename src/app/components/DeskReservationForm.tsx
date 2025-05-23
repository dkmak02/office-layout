import React, { useEffect, useState, useRef, use } from "react";
import {
  message,
  DatePicker,
  Select,
  Modal,
  Button,
  Flex,
  Descriptions,
  List,
  Card,
  Timeline,
  ConfigProvider,
} from "antd";
import dayjs from "dayjs";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Employee, UnassignedEmployee } from "../models/employeeModel";
import { Project } from "../models/projectModel";
import { DeskFormProps } from "../models/componentsModels";
import useProjects from "../util/api/ProjectApi";
import useDesks from "../util/api/DesksApi";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Reservation } from "../models/deskModel";
import { useHandleDeleteReservation } from "../util/handlers/deleteReservation";
import { useDataContext } from "../util/providers/AppDataContext";
import useUser from "../util/api/UserApi";
import useDesksMutations from "../util/api/DesksMutation";
import GenerateCard from "./ReservationCard";
import { User } from "../models/userModel";
import { allowDeleteReservation } from "../util/handlers/validatePermisions";
import { useTranslations } from "next-intl";

dayjs.extend(utc);
dayjs.extend(timezone);
const DeskReservationForm = ({
  desk,
  selectedFloor,
  onSubmit,
  onCancel,
  employees,
  unassignedEmployees,
}: DeskFormProps) => {
  const t = useTranslations("DeskReservation");
  const { name: deskName, reservations } = desk;
  const { data: userData } = useUser();
  const { setCurrentReservations, currentReservations, selectedDate } =
    useDataContext();
  const { handleDeleteReservation, handleDeleteReservationCurrentUser } =
    useHandleDeleteReservation();
  const { data: projects, changeProjectAsync } = useProjects(
    selectedFloor,
    selectedDate
  );
  const {
    changePersonAsync,
    changeDeskTypeAsync,
    hotdeskReservationAsync,
    hotdeskReservationCurrentUserAsync,
  } = useDesksMutations(selectedFloor, selectedDate);
  const projectCode = desk.hotdesk ? "Hotdesk" : desk.project.code;
  const projectAssigned = desk.hotdesk ? "Hotdesk" : desk.project.projectName;
  const currentReservation = desk.reservations.find(
    (reservation) => reservation.reservationID === desk.currentReservationID
  );
  const personAssigned = currentReservation
    ? currentReservation.userName
    : projectCode === "Hotdesk"
    ? userData?.name + " " + userData?.surname
    : null;

    let employeeId = null;

    if (
      !userData?.isAdmin &&
      projectCode === "Hotdesk" &&
      userData?.reservations &&
      userData.reservations.length > 0 &&
      userData.reservations[0].endTime !== null
    ) {
      employeeId = userData.id;
    } else if (currentReservation) {
      employeeId = currentReservation.userId;
    } else if (
      !userData?.isAdmin &&
      projectCode === "Hotdesk" &&
      !userData?.isModerator
    ) {
      employeeId = userData?.id;
    } else {
      employeeId = null;
    }
    const [selectedDates, setSelectedDates] = useState<any>(null);
    const [selectedPerson, setSeletedPerson] = useState<any>(personAssigned);
    const [selectedProject, setSelectedProject] =
      useState<string>(projectAssigned);
    const [showReservationModal, setShowReservationModal] =
      useState<boolean>(false);
    const [todayDeleted, setTodayDeleted] = useState<boolean>(false);
    const isProgrammaticUpdate = useRef(false);
    const [unassignedUsers, setUnassignedUsers] =
      useState<UnassignedEmployee[]>(unassignedEmployees);
    const [currentEmployee, setCurrentEmployee] =
      useState<UnassignedEmployee | null>(null);
    useEffect(() => {
      setCurrentReservations(reservations);
      setSeletedPerson(employeeId);
      setSelectedProject(projectCode);
      if (employeeId !== null) {
        const foundEmployee = employees.find(
          (e) => e.id === employeeId
        ) as UnassignedEmployee;
        if (foundEmployee) {
          setCurrentEmployee(foundEmployee);
          const filterHotdeskUsers = unassignedEmployees.filter(
            (employee) =>
              (employee.availability !== "0" ||
                ["USA", "DE", "MX"].includes(employee.availability)) &&
              selectedProject === "Hotdesk" &&
              !employee.ignoreAvailability
          );
          const filterProjectUsers = unassignedEmployees.filter(
            (employee) =>
              (employee.availability === "0" &&
                selectedProject !== "Hotdesk") ||
              employee.ignoreAvailability
          );
          if (selectedProject === "Hotdesk") {
            setUnassignedUsers([...filterHotdeskUsers, foundEmployee]);
          } else {
            setUnassignedUsers([...filterProjectUsers, foundEmployee]);
          }
        }
      } else {
        const filterHotdeskUsers = unassignedEmployees.filter(
          (employee) =>
            (employee.availability !== "0" ||
              ["USA", "DE", "MX"].includes(employee.availability)) &&
            selectedProject === "Hotdesk" &&
            !employee.ignoreAvailability
        );
        const filterProjectUsers = unassignedEmployees.filter(
          (employee) =>
            (employee.availability === "0" && selectedProject !== "Hotdesk") ||
            employee.ignoreAvailability
        );
        if (selectedProject === "Hotdesk") {
          setUnassignedUsers(filterHotdeskUsers);
        } else {
          setUnassignedUsers(filterProjectUsers);
        }
      }
    }, []);
    const doesRangeIncludeCustomDate = (start: any, end: any) => {
      const range = [];
      let current = start.clone();
      const customDates: any = [];
      for (let reservation of currentReservations) {
        let startDate = dayjs(reservation.startTime);
        const endDate = dayjs(reservation.endTime);
        while (startDate.isBefore(endDate) || startDate.isSame(endDate)) {
          customDates.push(startDate.format("YYYY-MM-DD"));
          startDate = startDate.add(1, "day");
        }
      }
      while (current.isBefore(end) || current.isSame(end)) {
        range.push(current.format("YYYY-MM-DD"));
        current = current.add(1, "day");
      }

      return range.some((date) => customDates.includes(date));
    };
    const isReservedDate = (current: any) => {
      for (let reservation of currentReservations) {
        const startDate = dayjs(reservation.startTime);
        const endDate = dayjs(reservation.endTime);

        if (
          current.isSame(startDate, "day") ||
          current.isSame(endDate, "day") ||
          (current.isAfter(startDate, "day") &&
            current.isBefore(endDate, "day"))
        ) {
          return true;
        }
      }
      for (let reservation of userData?.reservations ?? []) {
        // console.log(reservation);
        if (reservation.endTime === null) {
          continue;
        }
        const startDate = dayjs(reservation.startTime);
        const endDate = dayjs(reservation.endTime);
        if (
          current.isSame(startDate, "day") ||
          current.isSame(endDate, "day") ||
          (current.isAfter(startDate, "day") &&
            current.isBefore(endDate, "day"))
        ) {
          return true;
        }
      }
      return false;
    };

    const cellRender = (current: any, info: any) => {
      if (info.type !== "date") {
        return info.originNode;
      }
      return (
        <div
          className={`ant-picker-cell-inner`}
          style={{
            borderRadius: "50%",
          }}
        >
          {current.date()}
        </div>
      );
    };

    const handleRangeChange = (dates: any, dateStrings: any) => {
      if (isProgrammaticUpdate.current) {
        isProgrammaticUpdate.current = false;
        return;
      }
      if (!dates || dates.length !== 2) {
        setSelectedDates(null);
        return;
      }

      const [start, end] = dates;

      if (doesRangeIncludeCustomDate(start, end)) {
        message.error(t("invalidDateRange"));
        setSelectedDates(null);
        isProgrammaticUpdate.current = true;
      } else {
        setSelectedDates([start, end]);
      }
    };
    const onChangePerson = (value: any) => {
      setSeletedPerson(value);
    };
    const onChangeProject = (value: any) => {
      setSelectedProject(value);
      const filterHotdeskUsers = unassignedEmployees.filter(
        (employee) =>
          (employee.availability !== "0" ||
            ["USA", "DE", "MX"].includes(employee.availability)) &&
          value === "Hotdesk" &&
          !employee.ignoreAvailability
      );
      const filterProjectUsers = unassignedEmployees.filter(
        (employee) =>
          (employee.availability === "0" && value !== "Hotdesk") ||
          employee.ignoreAvailability
      );
      if (value === "Hotdesk") {
        setUnassignedUsers(filterHotdeskUsers);
      } else {
        setUnassignedUsers(filterProjectUsers);
      }
    };
    const validateHotDesk = () => {
      if (
        selectedProject === "Hotdesk" &&
        (!selectedDates || !selectedPerson)
      ) {
        message.error(t("hotdeskRangeNotChosen"));
        return false;
      }
      return true;
    };
    const submitProjectChange = async (
      project: Project,
      projectCode: string
    ) => {
      if (projectCode === project.code) {
        return;
      }
      if (
        desk.hotdesk &&
        project.code !== "Hotdesk" &&
        currentReservation &&
        currentReservations.length > 0
      ) {
        message.error(t("hotdeskHasFutureReservation"));
        return;
      }
      if (project.code === "Hotdesk") {
        await changeDeskTypeAsync({
          deskId: desk.deskId,
          deskType: "Hotdesk",
        });
        return;
      }
      if (!project.id) {
        message.error(t("invalidProjectId"));
        return;
      }
      if (userData?.isAdmin) {
        await changeDeskTypeAsync({
          deskId: desk.deskId,
          deskType: "Project",
        });
      }
      await changeProjectAsync({ deskId: desk.deskId, projectId: project.id });
    };
    const sumbmitEmployeeChange = async (
      employee: Employee,
      deskId: number
    ) => {
      if (employee.id === employeeId) {
        return;
      }
      try {
        await changePersonAsync({
          deskId,
          userId: employee.id,
        });
      } catch (error) {
        console.error("Error creating hotdesk reservation:", error);
        message.error(t("doubleReservationsNotAllowed"));
        return;
      }

      message.success(t("reservationSuccess"));
      onSubmit();
    };
    const submitHotdeskReservation = async (
      employee: Employee,
      deskId: number,
      startDate: string,
      endDate: string
    ) => {
      if (!employee.id) {
        message.error(t("employeeNotFound"));
        return;
      }
      const start = dayjs(startDate)
        .tz("Europe/Warsaw")
        .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      const endDateTime = dayjs(endDate)
        .add(23, "hour")
        .add(59, "minutes")
        .toDate();
      const end = dayjs(endDateTime)
        .tz("Europe/Warsaw")
        .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      try {
        if (userData?.isAdmin || userData?.isModerator) {
          await hotdeskReservationAsync({
            deskId,
            employeeId: employee.id,
            startDate: start,
            endDate: end,
          });
        } else {
          await hotdeskReservationCurrentUserAsync({
            deskId,
            employeeId: employee.id,
            startDate: start,
            endDate: end,
          });
        }
      } catch (error) {
        console.error("Error creating hotdesk reservation:", error);
        message.error(t("doubleReservationsNotAllowed"));
        return;
      }

      message.success(t("reservationSuccess"));
      onSubmit();
    };
    const handleSubmit = async (e: any) => {
      e.preventDefault();
      if (
        desk.hotdesk &&
        desk.reservations.length > 0 &&
        selectedProject !== "Hotdesk" &&
        currentReservations.length > 0
      ) {
        message.error(t("hotdeskHasFutureReservation"));
        return;
      }
      if (!selectedPerson && !selectedProject) {
        message.error(t("validationErrorEmployeeAndProject"));
        return;
      }
      const employee = employees.find((person) => person.id === selectedPerson);
      const project = (projects ?? []).find(
        (project) => project.code === selectedProject
      );
      if (!project) {
        message.error(t("validationErrorProject"));
        return;
      }
      if (
        project.code === "Hotdesk" &&
        employee &&
        employee.availability === "0"
      ) {
        message.error(t("remoteWork0Hotdesk"));
        return;
      }
      if (
        project.code !== "Hotdesk" &&
        employee &&
        employee.availability !== "0" &&
        !employee.ignoreAvailability
      ) {
        message.error(t("remoteWork1Desk"));
        return;
      }
      if (project.code === "Hotdesk" && employee && !selectedDates) {
        message.error(t("validationErrorHotdeskDateMissing"));
        return;
      }
      await submitProjectChange(project, projectCode);
      if (!employee) {
        onSubmit();
        return;
      }
      if (validateHotDesk() && project.code === "Hotdesk" && selectedDates) {
        submitHotdeskReservation(
          employee,
          desk.deskId,
          selectedDates[0],
          selectedDates[1]
        );
      } else if (
        project.code !== "Hotdesk" &&
        selectedPerson !== currentReservation?.userId
      ) {
        if (currentReservation && currentReservations.length > 0) {
          await handleDeleteReservation(currentReservation.reservationID);
        }
        sumbmitEmployeeChange(employee, desk.deskId);
      }
      onSubmit();
    };
    const validateRoles = (reservation?: Reservation) => {
      if (userData?.isAdmin || userData?.isModerator) return true;
      if (
        reservation &&
        userData?.id === reservation?.userId &&
        projectCode === "Hotdesk"
      ) {
        return true;
      }
      return false;
    };

    const showAllReservations = () => {
      setShowReservationModal(true);
    };
    const handleCardUnreserv = async (reservationId: number) => {
      try {
        if (userData?.isAdmin || userData?.isModerator) {
          await handleDeleteReservation(reservationId);
        } else {
          await handleDeleteReservationCurrentUser(reservationId);
        }
        if (reservationId === desk.currentReservationID) {
          setSeletedPerson(null);
          setSelectedDates(null);
          setTodayDeleted(true);
        }
        message.success(t("unreserveSuccess"));
      } catch (error) {
        console.error("Unreserve failed:", error);
        message.error(t("unreserveError"));
      }
    };
    const allowOwnReservation = () => {
      if (userData?.isAdmin || userData?.isModerator) return true;
      if (
        userData?.reservations &&
        userData.reservations.length > 0 &&
        userData.reservations[0].endTime === null
      )
        return false;

      if (userData?.id === selectedPerson) {
        return true;
      }
      return false;
    };
    if (!userData) return null;
    const genterateCard = (
      reservation: Reservation,
      userData: User,
      deskName: string,
      projectCode: string,
      handleCardUnreserv: (reservationId: number) => void,
      allowDeleteReservation: (
        userData?: User,
        reservation?: Reservation,
        projectCode?: string
      ) => boolean
    ) => {
      return (
        <GenerateCard
          reservation={reservation}
          userData={userData}
          deskName={deskName}
          projectCode={projectCode}
          handleCardUnreserv={handleCardUnreserv}
          validateRoles={allowDeleteReservation}
        />
      );
    };
    const handleUnreserve = async (e: any) => {
      e.preventDefault();
      if (!desk.currentReservationID) {
        message.error(t("noReservationFoundDelete"));
        return;
      }
      const reservation = reservations.find(
        (reservation) => reservation.reservationID === desk.currentReservationID
      );
      if (!reservation) {
        message.error(t("noReservationFoundDelete"));
        return;
      }
      try {
        if (userData?.isAdmin || userData?.isModerator) {
          await handleDeleteReservation(reservation.reservationID);
        } else {
          await handleDeleteReservationCurrentUser(reservation.reservationID);
        }
        message.success(t("unreserveSuccess"));
        onSubmit();
      } catch (error) {
        console.error("Unreserve failed:", error);
        message.error(t("unreserveError"));
      }
    };
    const isProjectDisabled =
      (!userData?.isAdmin && !userData?.isModerator) ||
      (selectedProject === "Hotdesk" &&
        userData?.isModerator &&
        !userData?.isAdmin);
    return (
      <Flex
        style={{
          flexDirection: "column",
          gap: "medium",
          justifyContent: "start",
          width: "100%",
        }}
      >
        <Modal
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <span>{deskName}</span>
              {projectCode === "Hotdesk" && (
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={showAllReservations}
                  style={{ marginLeft: "auto", marginRight: "20px" }}
                >
                  {t("showAll")}
                </Button>
              )}
            </div>
          }
          open={true}
          onCancel={onCancel}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <Descriptions title={`${t("personAssigned")}:`} />
              <Select
                style={{ width: "100%" }}
                showSearch
                placeholder={`${t("choosePerson")}`}
                optionFilterProp="label"
                defaultValue={employeeId}
                disabled={!userData?.isAdmin && !userData?.isModerator}
                value={selectedPerson}
                onChange={onChangePerson}
                options={unassignedUsers.map((person) => ({
                  label: person.name + " " + person.surname,
                  value: person.id,
                }))}
                className={`
    w-full 
    ${!userData?.isAdmin && !userData?.isModerator ? "pointer-events-none" : ""}
    [&_.ant-select-selector]:!text-black 
    [&_.ant-select-selector]:!bg-gray-100 
    [&_.ant-select-selector]:!opacity-100
  `}
              />
            </div>
            <div>
              <Descriptions title={`${t("projectAssigned")}:`} />

              <Select
                showSearch
                placeholder={`${t("chooseProject")}`}
                defaultValue={projectCode}
                disabled={isProjectDisabled}
                optionFilterProp="label"
                onChange={onChangeProject}
                options={(projects ?? [])
                  .filter(
                    (project) =>
                      !(
                        userData.isModerator &&
                        project.code === "Hotdesk" &&
                        !userData.isAdmin
                      )
                  )
                  .map((project) => ({
                    label: project.name,
                    value: project.code,
                  }))}
                style={{ width: "100%" }}
                className={`
    w-full
    ${isProjectDisabled ? "pointer-events-none" : ""}
    [&_.ant-select-selector]:!text-black 
    [&_.ant-select-selector]:!bg-gray-100 
    [&_.ant-select-selector]:!opacity-100
  `}
              />
            </div>
            {selectedProject === "Hotdesk" &&
              currentEmployee?.availability !== "0" &&
              !currentEmployee?.ignoreAvailability &&
              selectedPerson &&
              allowOwnReservation() && (
                <div className="calendar-container">
                  <DatePicker.RangePicker
                    value={selectedDates}
                    cellRender={cellRender}
                    onChange={handleRangeChange}
                    disabledDate={isReservedDate}
                    minDate={dayjs(selectedDate).startOf("day")}
                    maxDate={dayjs(new Date()).add(21, "day")}
                  />
                </div>
              )}
            <div style={{ display: "flex", gap: "8px" }}>
              {(!selectedPerson ||
                selectedProject === "Hotdesk" ||
                validateRoles()) &&
                allowOwnReservation() && (
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={handleSubmit}
                  >
                    {t("confirmButton")}
                  </Button>
                )}
              {currentReservation &&
                validateRoles(currentReservation) &&
                personAssigned &&
                !todayDeleted && (
                  <Button
                    color="red"
                    variant="outlined"
                    onClick={handleUnreserve}
                    style={{ color: "orange", borderColor: "orange" }}
                  >
                    {t("deleteReservationButton")}
                  </Button>
                )}
              {allowOwnReservation() && (
                <Button danger onClick={onCancel}>
                  {t("cancelButton")}
                </Button>
              )}
            </div>
          </div>
        </Modal>
        {showReservationModal && (
          <Modal
            title={t("reservationsTitle")}
            open={showReservationModal}
            onCancel={() => setShowReservationModal(false)}
            okButtonProps={{ style: { display: "none" } }}
            cancelButtonProps={{ style: { display: "none" } }}
          >
            <List
              dataSource={currentReservations}
              renderItem={(item: Reservation) =>
                genterateCard(
                  item,
                  userData,
                  deskName,
                  projectCode,
                  handleCardUnreserv,
                  allowDeleteReservation
                )
              }
              style={{
                maxHeight: 600,
                overflowY: "auto",
              }}
            />
          </Modal>
        )}
      </Flex>
    );
};

export default DeskReservationForm;
