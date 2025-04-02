import React, { useEffect, useState, useRef } from "react";
//import "./../styles/DeskForm.css";
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
interface DeskFormProps {
    deskData: {
        itemName: string;
        personAssigned: number | null;
        projectAssigned: string | null;
        reservations: any[];
        projectCode: string | null;
        employeeID: number | null;
    };
    onSubmit: (employee: any, project: any) => void;
    onCancel: () => void;
    onUnreserve: (reservationId: number, isTodayDeleted: boolean) => void;
    employees: any[];
    projects: any[];
    onSubmitHotdesk: (employee: any, project: any, dates: any[]) => void;
    }

const DeskForm = (
    {
  deskData,
  onSubmit,
  onCancel,
  onUnreserve,
  employees,
  projects,
  onSubmitHotdesk,
}:DeskFormProps
  ) => {
  const {
    itemName,
    personAssigned,
    projectAssigned,
    reservations,
    projectCode,
    employeeID,
  } = deskData;
  const [selectedDates, setSelectedDates] = useState<any>(null);
  const [selectedPerson, setSeletedPerson] = useState<any>(personAssigned);
  const [selectedProject, setSelectedProject] = useState<any>(projectAssigned);
  const [showReservationModal, setShowReservationModal] = useState<any>(false);
  const [newReservation, setNewReservation] = useState<any>(reservations);
  const [todayDeleted, setTodayDeleted] = useState<any>(false);
  const isProgrammaticUpdate = useRef(false);
  useEffect(() => {
    setSeletedPerson(employeeID);
    setSelectedProject(projectCode);
  }, []);
  const doesRangeIncludeCustomDate = (start:any, end:any) => {
    const range = [];
    let current = start.clone();
    const customDates:any = [];
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
  const isReservedDate = (current:any) => {
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
  const onChangePerson = (value:any) => {
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
      message.error("Wybierz osobę i projekt");
      return;
    }
    const employee = employees.find(
      (person) => Number(person.Id) === selectedPerson
    );
    const project = projects.find(
      (project) => project.group === selectedProject
    );
    if (selectedProject !== "Hotdesk") {
      onSubmit(employee, project);
    } else if (validateHotDesk()) {
      onSubmitHotdesk(employee, project, selectedDates);
    }
  };
  const validateRoles = () => {
    if (employees.length > 1) return true;
    if (employees[0].id === employeeID) return true;
    return false;
  };
  const handleUnreserve = () => {
    const reservations = deskData.reservations.filter(
      (reservation) => reservation.employeeId === employeeID
    );
    const currentDay = dayjs().startOf("day");
    const currentReservation = reservations.find((reservation) => {
      const startDate = dayjs(reservation.startDate);
      const endDate = reservation.endDate ? dayjs(reservation.endDate) : null;

      const isOngoingWithNoEnd =
        (startDate.isSame(currentDay, "day") ||
          startDate.isBefore(currentDay, "day")) &&
        !endDate;
      const isWithinRange =
        (startDate.isSame(currentDay, "day") ||
          startDate.isBefore(currentDay, "day")) &&
        endDate &&
        (endDate.isSame(currentDay, "day") ||
          endDate.isAfter(currentDay, "day"));
      const isStartingToday =
        startDate.isSame(currentDay, "day") &&
        (!endDate ||
          endDate.isSame(currentDay, "day") ||
          endDate.isAfter(currentDay, "day"));

      return isOngoingWithNoEnd || isWithinRange || isStartingToday;
    });

    onUnreserve(currentReservation.reservationId, true);
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
        title={`Rezerwacja: ${itemName}`}
        bordered={true}
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
            <span>{itemName}</span>
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
              defaultValue={employeeID}
              value={selectedPerson}
              onChange={onChangePerson}
              options={employees.map((person) => ({
                label: person.Name,
                value: Number(person.Id),
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
                value: project.group,
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
                onClick={handleUnreserve}
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

export default DeskForm;
