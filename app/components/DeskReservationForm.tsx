import React, { useEffect, useState, useRef } from "react";
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
} from "antd";
import dayjs from "dayjs";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Desk } from "../models/deskModel";
import { Employee } from "../models/employeeModel";
import { Project } from "../models/projectModel";
import { DeskFormProps } from "../models/componentsModels";
const DeskReservationForm = ({
  desk,
  onSubmit,
  onCancel,
  onUnreserve,
  employees,
  projects,
  onSubmitHotdesk,
}: DeskFormProps) => {
  const {
    name:deskName,
    reservations,
  } = desk;
  const projectCode = desk.hotdesk ? "Hotdesk" : desk.group[0].code;
  const projectAssigned = desk.hotdesk ? "Hotdesk" : desk.group[0].projectName;
  const personAssigned = desk.currentReservation
    ? desk.currentReservation.userName
    : null;
  const employeeId = desk.currentReservation
    ? desk.currentReservation.userId
    : null;
  const [selectedDates, setSelectedDates] = useState<any>(null);
  const [selectedPerson, setSeletedPerson] = useState<any>(personAssigned);
  const [selectedProject, setSelectedProject] = useState<any>(projectAssigned);
  const [showReservationModal, setShowReservationModal] = useState<any>(false);
  const [newReservation, setNewReservation] = useState<any>(reservations);
  const [todayDeleted, setTodayDeleted] = useState<any>(false);
  const isProgrammaticUpdate = useRef(false);
  useEffect(() => {
    setSeletedPerson(employeeId);
    setSelectedProject(projectCode);
  }, []);
  const doesRangeIncludeCustomDate = (start: any, end: any) => {
    const range = [];
    let current = start.clone();
    const customDates: any = [];
    for (let reservation of newReservation) {
      let startDate = dayjs(reservation.startDate);
      const endDate = dayjs(reservation.endDate);
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
    for (let reservation of newReservation) {
      const startDate = dayjs(reservation.startDate);
      const endDate = dayjs(reservation.endDate);

      if (
        current.isSame(startDate, "day") ||
        current.isSame(endDate, "day") ||
        (current.isAfter(startDate, "day") && current.isBefore(endDate, "day"))
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
      message.error("The selected range includes a restricted date.");
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
  };
  const validateHotDesk = () => {
    if (selectedProject === "Hotdesk" && !selectedDates && selectedPerson) {
      message.error("Please select a date range for the hotdesk.");
      return false;
    }
    return true;
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!selectedPerson && !selectedProject) {
      message.error("Please select an employee and a project.");
      return;
    }
    const employee = employees.find(
      (person) => person.id === selectedPerson
    );
    const project = projects.find(
      (project) => project.code === selectedProject
    );
    if (!employee) {
      message.error("Selected employee is invalid.");
      return;
    }
    if (!project) {
      message.error("Selected project is invalid.");
      return;
    }
    if (selectedProject !== "Hotdesk") {
      
      onSubmit(employee, project);
    } else if (validateHotDesk()) {
      if (!employee) {
        message.error("Selected employee is invalid.");
        return;
      }
      onSubmitHotdesk(employee, project, selectedDates);
    }
  };
  const validateRoles = () => {
    if (employees.length > 1) return true;
    if (employees[0].id === employeeId) return true;
    return false;
  };
  const handleCardUnreserv = (reservationId: any) => {
    onUnreserve(reservationId, false);
    const currentDay = dayjs().startOf("day");
    const reservation = newReservation.find(
      (reservation: any) => reservation.reservationId === reservationId
    );
    const startDate = dayjs(reservation.startDate);
    const isOngoingWithNoEnd =
      startDate.isSame(currentDay, "day") ||
      startDate.isBefore(currentDay, "day");
    console.log(isOngoingWithNoEnd);
    if (isOngoingWithNoEnd) {
      setSeletedPerson(null);
      setSelectedDates(null);
      setTodayDeleted(true);
    }
    setNewReservation(
      newReservation.filter(
        (reservation: any) => reservation.reservationId !== reservationId
      )
    );
  };
  const showAllReservations = () => {
    setShowReservationModal(true);
  };
  const genterateCard = (reservation: any) => {
    const startDate = dayjs(reservation.startDate).format("YYYY-MM-DD");
    const endDate =
      dayjs(reservation.endDate).year() === 9999
        ? "Brak daty zakończenia"
        : dayjs(reservation.endDate).format("YYYY-MM-DD");

    return (
      <Card
        key={reservation.reservationId}
        title={`Rezerwacja: ${deskName}`}
        variant="outlined"
        style={{ marginTop: 16 }}
      >
        <Timeline
          style={{ padding: 0, margin: 0 }}
          items={[
            {
              children: reservation.Name,
            },
            {
              dot: <ClockCircleOutlined className="timeline-clock-icon" />,
              color: "red",
              children: startDate + " / " + endDate,
              style: { padding: 0, margin: 0 },
            },
          ]}
        />
        {validateRoles() && (
          <Button
            danger
            onClick={() => handleCardUnreserv(reservation.reservationId)}
            style={{ margin: 0 }}
          >
            Usuń rezerwację
          </Button>
        )}
      </Card>
    );
  };
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
                Pokaż wszystkie rezerwacje
              </Button>
            )}
          </div>
        }
        open={true}
        onCancel={onCancel}
        okButtonProps={{ style: { display: "none" } }}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <Descriptions title="Przypisana osoba:" />
            <Select
              style={{ width: "100%" }}
              showSearch
              placeholder="Wybierz osobę"
              optionFilterProp="label"
              defaultValue={employeeId}
              value={selectedPerson}
              onChange={onChangePerson}
              options={employees.map((person) => ({
                label: person.name + " " + person.surname,
                value: person.id,
              }))}
            />
          </div>
          <div>
            <Descriptions title="Przypisany projekt:" />
            <Select
              showSearch
              placeholder="Wybierz projekt"
              defaultValue={projectCode}
              optionFilterProp="label"
              onChange={onChangeProject}
              options={projects.map((project) => ({
                label: project.name,
                value: project.code,
              }))}
              style={{ width: "100%" }}
            />
          </div>
          {selectedProject === "Hotdesk" && selectedPerson && (
            <div className="calendar-container">
              <DatePicker.RangePicker
                value={selectedDates}
                cellRender={cellRender}
                onChange={handleRangeChange}
                disabledDate={isReservedDate}
                minDate={dayjs().startOf("day")}
              />
            </div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            {(!personAssigned || selectedProject === "Hotdesk") && (
              <Button color="primary" variant="outlined" onClick={handleSubmit}>
                Zatwierdź
              </Button>
            )}
            {validateRoles() && personAssigned && !todayDeleted && (
              <Button
                color="red"
                variant="outlined"
                // onClick={handleUnreserve}
                style={{ color: "orange", borderColor: "orange" }}
              >
                Usuń rezerwację
              </Button>
            )}
            <Button danger onClick={onCancel}>
              Anuluj
            </Button>
          </div>
        </div>
      </Modal>
      {showReservationModal && (
        <Modal
          title="Rezerwacje"
          open={showReservationModal}
          onCancel={() => setShowReservationModal(false)}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <List
            dataSource={newReservation}
            renderItem={(item) => genterateCard(item)}
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
