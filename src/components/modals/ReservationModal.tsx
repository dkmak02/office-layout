import React, { useState } from "react";
import { Modal, Form, Select, DatePicker, Button, Space, Typography, Alert, Descriptions, List, Flex, message } from "antd";
import { UserOutlined, CalendarOutlined, DesktopOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useUser } from "@/api/queries/auth/get-user";
import { Desk } from "@/models/Desk";
import { Employee } from "@/models/Employee";
import { useProjectInfo } from "@/api/queries/project/project-api-page";
import { Project } from "@/models/Project";
import { useCreateReservation } from "@/api/mutations/reservations/create-reservation";
import { useChangeDeskType, useChangeProject } from "@/api/mutations/project/change-desk-type";
import { useDeleteReservation } from "@/api/mutations/reservations/delete-reservation";
import { useTranslations } from "next-intl";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ReservationModalProps {
  visible: boolean;
  onClose: () => void;
  desk: Desk | null;
  employees: Employee[];
  availableEmployees: Employee[];
  floor?: string;
  date?: string;
}

interface ReservationFormData {
  employeeId?: number;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
  startTime?: dayjs.Dayjs;
  endTime?: dayjs.Dayjs;
  projectId?: number;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  visible,
  onClose,
  desk,
  employees,
  availableEmployees,
  floor,
  date
}) => {
  const { data: user } = useUser();
  const { data: projects } = useProjectInfo();
  const tModal = useTranslations("ReservationModal");
  const [form] = Form.useForm<ReservationFormData>();
  const [loading, setLoading] = useState(false);
  const [showAllReservations, setShowAllReservations] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>();
  const [selectedProjectId, setSelectedProjectId] = useState<number | string | undefined>();
  const [selectedDates, setSelectedDates] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [deletedReservationIds, setDeletedReservationIds] = useState<Set<number>>(new Set());

  // Mutation hooks
  const createReservationMutation = useCreateReservation();
  const changeDeskTypeMutation = useChangeDeskType();
  const changeProjectMutation = useChangeProject();
  const deleteReservationMutation = useDeleteReservation();

  const isAdmin = user?.isAdmin || user?.isModerator;
  const isTrueAdmin = user?.isAdmin || false; // Only true admins, not moderators
  const isHotdesk = desk?.hotdesk || false;

  // Determine current desk type based on selected project (for real-time UI updates)
  const currentDeskType = isTrueAdmin && selectedProjectId !== undefined 
    ? (selectedProjectId === "Hotdesk" ? "Hotdesk" : "Project")
    : (isHotdesk ? "Hotdesk" : "Project");
  const isCurrentlyHotdesk = currentDeskType === "Hotdesk";

  // Get current user's employee data to check availability
  const currentEmployee = employees.find(emp => emp.id === user?.id);

  // Filter projects (exclude Hotdesk project for assignment)
  const availableProjects = projects?.filter((project: Project) => project.code !== "Hotdesk") || [];

  // Current reservation info - exclude deleted reservations
  const currentReservation = desk?.reservations?.find(r => 
    r.reservationID === desk.currentReservationID && 
    !deletedReservationIds.has(r.reservationID)
  );
  // Determine if user can make reservations
  const canMakeReservation = () => {
    if (isAdmin) return true; // Admin/moderator can always reserve
    if (!isCurrentlyHotdesk) return false; // Regular employees can't reserve regular desks
    
    // For hotdesk reservations, check multiple conditions
    if (isCurrentlyHotdesk) {
      // Check availability is not "0"
      if (currentEmployee?.availability === "0") return false;
      // Check ignoreAvailability is not true
      if (currentEmployee?.ignoreAvailability === true) return false;
      return true;
    }
    
    return false;
  };
  
  const canReserve = canMakeReservation();

  // Filter employees based on desk type and user role
  const getAvailableEmployees = () => {
    if (!isAdmin && canReserve) {
      // Regular employees can only reserve for themselves
      return user ? [{ 
        id: user.id, 
        name: user.name, 
        surname: user.surname,
        // Add other required Employee fields with defaults
        companyName: "",
        department: "",
        position: "",
        availability: "",
        permanentlyAssigned: false,
        hotdeskReservation: false,
        ignoreAvailability: false
      }] : [];
    }

    if (!canReserve) return []; // No employees if can't reserve

    if (isCurrentlyHotdesk) {
      // For hotdesk: only employees who can reserve hotdesk (availability != "0" and !ignoreAvailability)
      return availableEmployees.filter(emp => 
        !emp.permanentlyAssigned && 
        emp.availability !== "0" && 
        !emp.ignoreAvailability
      );
    } else {
      // For regular desk: only employees who CANNOT reserve hotdesk (availability == "0" or ignoreAvailability == true)
      return availableEmployees.filter(emp => 
        emp.availability === "0" || emp.ignoreAvailability === true
      );
    }
  };

  const availableEmployeesByDeskType = getAvailableEmployees();

  // Get employee options including currently assigned employee
  const getEmployeeOptions = () => {
    let options = availableEmployeesByDeskType.map((person) => ({
      label: person.name + " " + person.surname,
      value: person.id,
    }));
    // Always include the current reservation's employee if there is one
    const currentReservationUserId = currentReservation?.userId;
    if (currentReservationUserId && !availableEmployeesByDeskType.find(emp => emp.id === currentReservationUserId)) {
      const currentEmployee = employees.find(emp => emp.id === currentReservationUserId);
      if (currentEmployee) {
        options.unshift({
          label: `${currentEmployee.name} ${currentEmployee.surname} (Current)`,
          value: currentEmployee.id,
        });
      }
    }

    // Also include selectedEmployeeId if it's different from current reservation and not in available list
    if (selectedEmployeeId && 
        selectedEmployeeId !== currentReservationUserId && 
        !availableEmployeesByDeskType.find(emp => emp.id === selectedEmployeeId)) {
      const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
      if (selectedEmployee) {
        options.unshift({
          label: `${selectedEmployee.name} ${selectedEmployee.surname}`,
          value: selectedEmployee.id,
        });
      }
    }

    return options;
  };

  // Initialize form values
  React.useEffect(() => {
    if (desk) {
      // Initialize employee ID
      let initialEmployeeId;
      if (!isAdmin && canReserve) {
        // Regular user who can reserve - set to their own ID
        initialEmployeeId = user?.id;
      } else if (currentReservation?.userId) {
        // There's a current reservation - set to that user
        initialEmployeeId = currentReservation.userId;
      } else {
        initialEmployeeId = undefined;
      }

      // Initialize project ID
      let initialProjectId;
      if (isHotdesk) {
        // For hotdesk, use the special "Hotdesk" value
        initialProjectId = "Hotdesk";
      } else if (desk.project?.code) {
        // For regular desk, find the project by code
        const foundProject = projects?.find((p: Project) => p.code === desk.project?.code);
        initialProjectId = foundProject?.id;
      } else {
        initialProjectId = undefined;
      }
      
      setSelectedEmployeeId(initialEmployeeId);
      setSelectedProjectId(initialProjectId);
      
      form.setFieldsValue({
        employeeId: initialEmployeeId,
        projectId: initialProjectId,
      });
    }
  }, [desk, user, projects, isAdmin, canReserve, currentReservation, isHotdesk]);

  // Reset deleted reservations and dates when modal opens or desk changes
  React.useEffect(() => {
    if (visible) {
      setDeletedReservationIds(new Set());
      setSelectedDates(null); // Clear dates when modal opens
    }
  }, [visible, desk?.deskId]);

  // Reset form when current reservation is deleted
  React.useEffect(() => {
    if (!currentReservation && desk?.currentReservationID && deletedReservationIds.has(desk.currentReservationID)) {
      // Current reservation was deleted, reset the form for new assignment
      if (isTrueAdmin) {
        setSelectedEmployeeId(undefined);
        form.setFieldValue('employeeId', undefined);
      }
    }
  }, [currentReservation, desk?.currentReservationID, deletedReservationIds, isTrueAdmin, form]);

  // Reset employee selection when desk type changes
  React.useEffect(() => {
    if (isTrueAdmin && selectedProjectId !== undefined) {
      const newAvailableEmployees = getAvailableEmployees();
      const currentEmployeeStillAvailable = newAvailableEmployees.find(emp => emp.id === selectedEmployeeId);
      
      if (!currentEmployeeStillAvailable) {
        setSelectedEmployeeId(undefined);
        form.setFieldValue('employeeId', undefined);
      }
      
      // Clear dates when switching to project desk
      if (!isCurrentlyHotdesk) {
        setSelectedDates(null);
      }
    }
  }, [selectedProjectId, isTrueAdmin, isCurrentlyHotdesk]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEmployeeChange = (value: number) => {
    setSelectedEmployeeId(value);
  };

  const handleProjectChange = (value: number | string) => {
    setSelectedProjectId(value);
  };

  const handleDateChange = (dates: any) => {
    setSelectedDates(dates);
  };

  // Function to check if a date is disabled due to existing reservations
  const isDateDisabled = (current: dayjs.Dayjs) => {
    // Disable past dates
    if (current && current < dayjs().startOf('day')) {
      return true;
    }

    // Disable dates more than 21 days in the future
    if (current && current > dayjs().add(21, 'days').endOf('day')) {
      return true;
    }

    if (!current) return false;

    const currentDate = current.format("YYYY-MM-DD");

    // Check if desk has reservations on this date (excluding deleted ones)
    const deskReservations = (desk?.reservations || []).filter(r => 
      !deletedReservationIds.has(r.reservationID)
    );

    for (const reservation of deskReservations) {
      const startDate = dayjs(reservation.startTime).format("YYYY-MM-DD");
      const endDate = reservation.endTime ? dayjs(reservation.endTime).format("YYYY-MM-DD") : startDate;
      
      // Check if current date falls within this reservation period
      if (current.isSame(startDate, 'day') || current.isSame(endDate, 'day') || 
          (current.isAfter(startDate, 'day') && current.isBefore(endDate, 'day'))) {
        return true;
      }
    }

    // Check if current user has reservations on other desks on this date (for non-admins)
    if (!isAdmin && user?.id && selectedEmployeeId === user.id && user.reservations) {
      for (const userReservation of user.reservations) {
        // Skip the current desk's reservations (already checked above)
        if (userReservation.deskNo === desk?.name) continue;
        
        const startDate = dayjs(userReservation.startTime).format("YYYY-MM-DD");
        const endDate = userReservation.endTime ? dayjs(userReservation.endTime).format("YYYY-MM-DD") : startDate;
        
        // Check if current date falls within this reservation period
        if (current.isSame(startDate, 'day') || current.isSame(endDate, 'day') || 
            (current.isAfter(startDate, 'day') && current.isBefore(endDate, 'day'))) {
          return true;
        }
      }
    }

    return false;
  };

  const handleSubmit = async () => {
    if (!canReserve && !isAdmin) return; // Safety check
    setLoading(true);
    try {
      // Step 0: Comprehensive validation
      const employeeChanged = selectedEmployeeId !== currentReservation?.userId;
      
      // Check if dates have changed for hotdesk reservations
      const datesChanged = isCurrentlyHotdesk && currentReservation && selectedDates && (() => {
        const currentStartDate = dayjs(currentReservation.startTime).format("YYYY-MM-DD");
        const currentEndDate = currentReservation.endTime ? dayjs(currentReservation.endTime).format("YYYY-MM-DD") : currentStartDate;
        const selectedStartDate = selectedDates[0].format("YYYY-MM-DD");
        const selectedEndDate = selectedDates[1].format("YYYY-MM-DD");
        
        return currentStartDate !== selectedStartDate || currentEndDate !== selectedEndDate;
      })();
      
      const needsNewReservation = canReserve && selectedEmployeeId && (employeeChanged || !currentReservation || datesChanged);
      
      // Note: needsNewReservation now includes date changes for hotdesk reservations,
      // allowing users to update reservation dates for the same employee

      // Determine final desk type after potential changes
      let finalDeskType = isHotdesk ? "Hotdesk" : "Project";          
      if (isAdmin && selectedProjectId) {
        finalDeskType = selectedProjectId === "Hotdesk" ? "Hotdesk" : "Project";
      }

      // Validation for reservation creation
      if (needsNewReservation) {
        // Check if employee is selected
        if (!selectedEmployeeId) {
          message.error(tModal("employeeRequired"));
          return;
        }

        // Check if dates are selected for hotdesk reservations
        if (finalDeskType === "Hotdesk" && !selectedDates) {
          message.error(tModal("hotdeskDateRequired"));
          return;
        }

        // Additional date validations for hotdesk
        if (finalDeskType === "Hotdesk" && selectedDates) {
          const startDate = selectedDates[0];
          const endDate = selectedDates[1];
          
          // Check if dates are in the past
          if (startDate.isBefore(dayjs().startOf('day'))) {
            message.error(tModal("pastDateSelected"));
            return;
          }
          
          // Check if date range is too long (more than 21 days)
          if (endDate.diff(startDate, 'days') > 21) {
            message.error(tModal("dateRangeTooLong"));
            return;
          }
          
          // Check if start date is after end date
          if (startDate.isAfter(endDate)) {
            message.error(tModal("invalidDateRange"));
            return;
          }
        }

        // Check for project desk requirements
        if (finalDeskType === "Project") {
          // For project desks, ensure project is selected (admin only)
          if (isAdmin && !selectedProjectId) {
            message.error(tModal("projectRequired"));
            return;
          }
        }

        // Check if user has conflicting reservations (for non-admins)
        if (!isAdmin && finalDeskType === "Hotdesk" && selectedDates && user?.reservations) {
          const startDate = selectedDates[0].format("YYYY-MM-DD");
          const endDate = selectedDates[1].format("YYYY-MM-DD");
          
          for (const userReservation of user.reservations) {
            // Skip the current desk's reservations
            if (userReservation.deskNo === desk?.name) continue;
            
            const reservationStart = dayjs(userReservation.startTime).format("YYYY-MM-DD");
            const reservationEnd = userReservation.endTime ? dayjs(userReservation.endTime).format("YYYY-MM-DD") : reservationStart;
            
            // Check for date overlap
            const selectedStart = dayjs(startDate);
            const selectedEnd = dayjs(endDate);
            const existingStart = dayjs(reservationStart);
            const existingEnd = dayjs(reservationEnd);
            
            if (selectedStart.isSame(existingStart, 'day') || selectedStart.isSame(existingEnd, 'day') ||
                selectedEnd.isSame(existingStart, 'day') || selectedEnd.isSame(existingEnd, 'day') ||
                (selectedStart.isAfter(existingStart, 'day') && selectedStart.isBefore(existingEnd, 'day')) ||
                (selectedEnd.isAfter(existingStart, 'day') && selectedEnd.isBefore(existingEnd, 'day')) ||
                (existingStart.isAfter(selectedStart, 'day') && existingStart.isBefore(selectedEnd, 'day'))) {
              message.error(tModal("dateConflict"));
              return;
            }
          }
        }
      }

      // Validation for admin project/desk type changes
      if (isAdmin && selectedProjectId) {
        if (selectedProjectId === "Hotdesk") {
          // Only true admins can convert a regular desk to hotdesk
          // But moderators can make reservations on existing hotdesks
          if (!isTrueAdmin && !isHotdesk) {
            // This is trying to convert a regular desk to hotdesk - only true admins can do this
            message.error(tModal("adminOnlyHotdesk"));
            return;
          }
        }
        
        // If converting to hotdesk and there's an employee selected, require dates
        if (selectedProjectId === "Hotdesk" && selectedEmployeeId && !selectedDates) {
          message.error(tModal("hotdeskDateRequired"));
          return;
        }
        
        // If converting to hotdesk and dates are selected, validate them
        if (selectedProjectId === "Hotdesk" && selectedDates) {
          const startDate = selectedDates[0];
          const endDate = selectedDates[1];
          
          // Check if dates are in the past
          if (startDate.isBefore(dayjs().startOf('day'))) {
            message.error(tModal("pastDateSelected"));
            return;
          }
          
          // Check if date range is too long (more than 21 days)
          if (endDate.diff(startDate, 'days') > 21) {
            message.error(tModal("dateRangeTooLong"));
            return;
          }
          
          // Check if start date is after end date
          if (startDate.isAfter(endDate)) {
            message.error(tModal("invalidDateRange"));
            return;
          }
        }
      }

      let deskTypeChanged = false;
      
      // Step 1: Handle project/desk type changes first (admin/moderator)
      if (isAdmin && selectedProjectId) {
        if (selectedProjectId === "Hotdesk") {
          // Convert to hotdesk only if it's not already a hotdesk
          if (!isHotdesk) {
            await changeDeskTypeMutation.mutateAsync({
              deskId: desk?.deskId!,
              deskType: "Hotdesk",
              floor,
              date,
            });
            message.success(tModal("deskConvertedToHotdesk"));
            deskTypeChanged = true;
            finalDeskType = "Hotdesk";
            
            
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          // Check if project actually changes
          const currentProjectId = desk?.project?.code ? projects?.find((p: Project) => p.code === desk.project?.code)?.id : undefined;
          const projectChanged = currentProjectId !== selectedProjectId;
          
          // Convert to project desk and assign project
          if (isHotdesk) {
            // Only convert from hotdesk to project if it's currently a hotdesk
            await changeDeskTypeMutation.mutateAsync({
              deskId: desk?.deskId!,
              deskType: "Project",
              floor,
              date,
            });
            deskTypeChanged = true;
            finalDeskType = "project";
            
            // Wait for backend to process the desk type change
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // Only assign project if it actually changed
          if (projectChanged) {
            await changeProjectMutation.mutateAsync({
              deskId: desk?.deskId!,
              projectId: selectedProjectId as number,
              floor,
              date,
            });
            message.success(tModal("projectAssignedSuccess"));
          }
          
        }
      }
      
      // Step 2: Handle reservation creation ONLY if employee has changed or there's no current reservation
      if (needsNewReservation) {
        const useCurrentUserEndpoint = !isAdmin;
        if (finalDeskType === "Hotdesk" && selectedDates) {
          // Create hotdesk reservation (using final desk type)

          await createReservationMutation.mutateAsync({
            deskId: desk?.deskId!,
            employeeId: selectedEmployeeId,
            startDate: selectedDates[0].add(1, "seconds").format("YYYY-MM-DDTHH:mm:ss"),
            endDate: selectedDates[1].add(23, "hours").add(59, "minutes").format("YYYY-MM-DDTHH:mm:ss"),
            isHotdesk: true,
            useCurrentUserEndpoint,
            floor,
            date,
          });
          
          // Show appropriate success message based on whether it's a date change or new reservation
          if (datesChanged && !employeeChanged) {
            message.success(tModal("hotdeskDatesUpdated"));
          } else {
            message.success(tModal("hotdeskReservationCreated"));
          }
        } else if (finalDeskType === "Project") {
          // Create project desk assignment (using final desk type)
          await createReservationMutation.mutateAsync({
            deskId: desk?.deskId!,
            employeeId: selectedEmployeeId,
            isHotdesk: false,
            useCurrentUserEndpoint,
            floor,
            date,
          });
          message.success(tModal("deskAssignmentCreated"));
        }
      }
      
      // Close modal on success
      onClose();
      form.resetFields();
    } catch (error:any) {
      console.error("Error in submission:", error);
      console.log(error.response?.data.messageCode);
      // Use specific error message based on messageCode if available
      const messageCode = error.response?.data?.messageCode;
      if (messageCode && tModal(messageCode) !== messageCode) {
        message.error(tModal(messageCode));
      } else {
        message.error(tModal("operationFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnreserve = async () => {
    if (!currentReservation) return;
    setLoading(true);
    try {
      const useHotdeskEndpoint = !isAdmin && isHotdesk;
      
      await deleteReservationMutation.mutateAsync({
        reservationId: currentReservation.reservationID,
        useHotdeskEndpoint,
        floor,
        date,
      });
      
      message.success(tModal("reservationDeletedSuccess"));
      onClose();
    } catch (error: any) {
      console.error("Error deleting reservation:", error);
      // Use specific error message based on messageCode if available
      const messageCode = error.response?.data?.messageCode;
      if (messageCode && tModal(messageCode) !== messageCode) {
        message.error(tModal(messageCode));
      } else {
        message.error(tModal("reservationDeleteFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const validateRoles = () => {
    if (isAdmin) return true;
    if (currentReservation && user?.id === currentReservation.userId && isHotdesk) {
      return true;
    }
    return false;
  };

  // Check if user can delete a specific reservation
  const canDeleteReservation = (reservation: any) => {
    if (isAdmin) return true; // Admin can delete all reservations
    // Employee can only delete their own hotdesk reservations
    if (user?.id === reservation.userId && isHotdesk) {
      return true;
    }
    return false;
  };

  const handleDeleteFromList = async (reservationId: number, userId: number) => {
    try {
      setLoading(true);
      const useHotdeskEndpoint = !isAdmin && isHotdesk && user?.id === userId;
      
      await deleteReservationMutation.mutateAsync({
        reservationId,
        useHotdeskEndpoint,
        floor,
        date,
      });
      
      // Add to deleted reservations set for immediate UI update
      setDeletedReservationIds(prev => new Set([...prev, reservationId]));
      
      message.success(tModal("reservationDeletedSuccess"));
    } catch (error: any) {
      console.error("Error deleting reservation:", error);
      // Use specific error message based on messageCode if available
      const messageCode = error.response?.data?.messageCode;
      if (messageCode && tModal(messageCode) !== messageCode) {
        message.error(tModal(messageCode));
      } else {
        message.error(tModal("reservationDeleteFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get employee name by ID
  const getEmployeeName = (userId: number) => {
    const employee = employees.find(emp => emp.id === userId);
    return employee ? `${employee.name} ${employee.surname}` : `Employee ID: ${userId}`;
  };

  const isProjectDisabled = (!isAdmin) || (isHotdesk && user?.isModerator && !user?.isAdmin);

  if (!desk) return null;

  return (
    <Flex style={{ flexDirection: "column", gap: "medium", justifyContent: "start", width: "100%" }}>
      <Modal
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div>
              <Text strong style={{ fontSize: "18px", color: "#1890ff" }}>
                {desk.name}
              </Text>
            </div>
            {isHotdesk && desk.reservations && desk.reservations.filter(r => !deletedReservationIds.has(r.reservationID)).length > 0 && (
              <Button
                color="primary"
                variant="outlined"
                onClick={() => setShowAllReservations(true)}
                style={{ marginLeft: "auto", marginRight: "20px" }}
              >
                Show All
              </Button>
            )}
          </div>
        }
        open={visible}
        onCancel={onClose}
        okButtonProps={{ style: { display: "none" } }}
        cancelButtonProps={{ style: { display: "none" } }}
        width={500}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Alerts based on user permissions */}
          {!isAdmin && !isCurrentlyHotdesk && (
            <Alert
              message={tModal("regularDeskViewOnly")}
              description={tModal("regularDeskViewOnlyDescription")}
              type="info"
            />
          )}
          
          {!isAdmin && isCurrentlyHotdesk && currentEmployee?.availability === "0" && (
            <Alert
              message={tModal("hotdeskUnavailable")}
              description={tModal("hotdeskUnavailableAvailability")}
              type="warning"
            />
          )}
          
          {!isAdmin && isCurrentlyHotdesk && currentEmployee?.ignoreAvailability === true && (
            <Alert
              message={tModal("hotdeskUnavailable")}
              description={tModal("hotdeskUnavailableIgnore")}
              type="warning"
            />
          )}

          {/* Person Assignment Section */}
          {(canReserve || isAdmin) && (
            <div>
              <Descriptions title={tModal("personAssigned")} />
              <Select
                style={{ width: "100%" }}
                showSearch
                placeholder={tModal("choosePerson")}
                optionFilterProp="label"
                value={selectedEmployeeId || currentReservation?.userId}
                disabled={!isAdmin}
                onChange={handleEmployeeChange}
                options={getEmployeeOptions()}
                className={`w-full ${!isAdmin ? "pointer-events-none" : ""} [&_.ant-select-selector]:!text-black [&_.ant-select-selector]:!bg-gray-100 [&_.ant-select-selector]:!opacity-100`}
              />
            </div>
          )}

          {/* Project Assignment Section */}
          {isAdmin && (
            <div>
              <Descriptions title={tModal("projectAssigned")} />
              <Select
                showSearch
                placeholder={isHotdesk ? tModal("selectProjectToConvertHotdesk") : tModal("chooseProject")}
                value={selectedProjectId}
                disabled={isProjectDisabled}
                optionFilterProp="label"
                onChange={handleProjectChange}
                options={[
                  ...(isTrueAdmin || isHotdesk ? [{ label: "Hotdesk", value: "Hotdesk" }] : []),
                  ...availableProjects.map((project: Project) => ({
                    label: project.name,
                    value: project.id,
                  }))
                ]}
                style={{ width: "100%" }}
                className={`w-full ${isProjectDisabled ? "pointer-events-none" : ""} [&_.ant-select-selector]:!text-black [&_.ant-select-selector]:!bg-gray-100 [&_.ant-select-selector]:!opacity-100`}
              />
            </div>
          )}

          {/* Date Range for Hotdesk */}
          {isCurrentlyHotdesk && canReserve && selectedEmployeeId && (
            <div className="calendar-container">
              <RangePicker
                value={selectedDates}
                onChange={handleDateChange}
                disabledDate={isDateDisabled}
                style={{ width: "100%" }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            {(canReserve || (isAdmin && selectedProjectId)) && (
              <Button
                color="primary"
                variant="outlined"
                onClick={handleSubmit}
                loading={loading}
                disabled={
                  // Only disable for non-admin users making hotdesk reservations
                  (!isAdmin && canReserve && isCurrentlyHotdesk && (!selectedDates || !selectedEmployeeId))
                }
              >
                {tModal("confirm")}
              </Button>
            )}
            
            {currentReservation && validateRoles() && (
              <Button
                onClick={handleUnreserve}
                loading={loading}
                style={{ color: "orange", borderColor: "orange" }}
                variant="outlined"
              >
                {tModal("deleteReservation")}
              </Button>
            )}
            
            <Button danger onClick={onClose}>
              {canReserve ? tModal("cancel") : tModal("close")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* All Reservations Modal */}
      {showAllReservations && (
        <Modal
          title={tModal("allReservations")}
          open={showAllReservations}
          onCancel={() => setShowAllReservations(false)}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
          width={600}
        >
          <List
            dataSource={(desk.reservations || []).filter(reservation => 
              !deletedReservationIds.has(reservation.reservationID)
            )}
            renderItem={(reservation) => (
              <List.Item>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <Text strong>{getEmployeeName(reservation.userId)}</Text>
                    <br />
                    <Text type="secondary">
                      {dayjs(reservation.startTime).format("MMM DD, YYYY")} - {
                        reservation.endTime ? dayjs(reservation.endTime).format("MMM DD, YYYY") : tModal("open")
                      }
                    </Text>
                  </div>
                  {canDeleteReservation(reservation) && (
                    <Button
                      danger
                      size="small"
                      loading={loading}
                      onClick={() => handleDeleteFromList(reservation.reservationID, reservation.userId)}
                      style={{ marginLeft: "12px" }}
                    >
                      {tModal("delete")}
                    </Button>
                  )}
                </div>
              </List.Item>
            )}
            style={{ maxHeight: 600, overflowY: "auto" }}
          />
        </Modal>
      )}
    </Flex>
  );
};

export default ReservationModal; 