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

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ReservationModalProps {
  visible: boolean;
  onClose: () => void;
  desk: Desk | null;
  employees: Employee[];
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
  floor,
  date
}) => {
  const { data: user } = useUser();
  const { data: projects } = useProjectInfo();
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
    ? (selectedProjectId === "hotdesk" ? "hotdesk" : "project")
    : (isHotdesk ? "hotdesk" : "project");
  const isCurrentlyHotdesk = currentDeskType === "hotdesk";

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
      return employees.filter(emp => 
        !emp.permanentlyAssigned && 
        emp.availability !== "0" && 
        !emp.ignoreAvailability
      );
    } else {
      // For regular desk: only employees who CANNOT reserve hotdesk (availability == "0" or ignoreAvailability == true)
      return employees.filter(emp => 
        emp.availability === "0" || emp.ignoreAvailability === true
      );
    }
  };

  const availableEmployees = getAvailableEmployees();

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
        // For hotdesk, use the special "hotdesk" value
        initialProjectId = "hotdesk";
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

  // Reset deleted reservations when modal opens or desk changes
  React.useEffect(() => {
    if (visible) {
      setDeletedReservationIds(new Set());
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

  const handleSubmit = async () => {
    if (!canReserve && !isAdmin) return; // Safety check
    setLoading(true);
    try {
      let deskTypeChanged = false;
      let finalDeskType = isHotdesk ? "hotdesk" : "project";
      
      // Step 1: Handle project/desk type changes first (admin/moderator)
      if (isAdmin && selectedProjectId) {
        if (selectedProjectId === "hotdesk") {
          // Only true admins can convert to hotdesk
          if (!isTrueAdmin) {
            message.error("Only administrators can convert desks to hotdesk. Moderators cannot perform this action.");
            return;
          }
          // Convert to hotdesk only if it's not already a hotdesk
          if (!isHotdesk) {
            await changeDeskTypeMutation.mutateAsync({
              deskId: desk?.deskId!,
              deskType: "Hotdesk",
              floor,
              date,
            });
            message.success("Desk converted to hotdesk successfully");
            deskTypeChanged = true;
            finalDeskType = "hotdesk";
            
            // Wait for backend to process the desk type change
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
          }
          
          message.success(isHotdesk ? "Desk converted to project successfully" : projectChanged ? "Project assigned successfully" : "No changes made");
        }
      }
      
      // Step 2: Handle reservation creation AFTER desk changes (if user can reserve and wants to)
      if (canReserve && selectedEmployeeId) {
        const useCurrentUserEndpoint = !isAdmin;
        
        if (finalDeskType === "hotdesk" && selectedDates) {
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
          message.success("Hotdesk reservation created successfully");
        } else if (finalDeskType === "project") {
          // Create project desk assignment (using final desk type)
          await createReservationMutation.mutateAsync({
            deskId: desk?.deskId!,
            employeeId: selectedEmployeeId,
            isHotdesk: false,
            useCurrentUserEndpoint,
            floor,
            date,
          });
          message.success("Desk assignment created successfully");
        }
      }
      
      // Close modal on success
      onClose();
      form.resetFields();
    } catch (error) {
      console.error("Error in submission:", error);
      message.error("Failed to complete operation. Please try again.");
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
      
      message.success("Reservation deleted successfully");
      onClose();
    } catch (error) {
      console.error("Error deleting reservation:", error);
      message.error("Failed to delete reservation. Please try again.");
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
      
      console.log("Deleting reservation:", {
        reservationId,
        useHotdeskEndpoint,
      });
      await deleteReservationMutation.mutateAsync({
        reservationId,
        useHotdeskEndpoint,
        floor,
        date,
      });
      
      // Add to deleted reservations set for immediate UI update
      setDeletedReservationIds(prev => new Set([...prev, reservationId]));
      
      message.success("Reservation deleted successfully");
    } catch (error) {
      console.error("Error deleting reservation:", error);
      message.error("Failed to delete reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isProjectDisabled = (!isAdmin) || (isHotdesk && user?.isModerator && !user?.isAdmin);

  if (!desk) return null;

  return (
    <Flex style={{ flexDirection: "column", gap: "medium", justifyContent: "start", width: "100%" }}>
      <Modal
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <span>{desk.name}</span>
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
              message="Regular Desk - View Only"
              description="You can only view information about regular desks. Only admins can make reservations for regular desks."
              type="info"
            />
          )}
          
          {!isAdmin && isCurrentlyHotdesk && currentEmployee?.availability === "0" && (
            <Alert
              message="Hotdesk Unavailable"
              description="You cannot reserve hotdesks because your availability is set to 0%."
              type="warning"
            />
          )}
          
          {!isAdmin && isCurrentlyHotdesk && currentEmployee?.ignoreAvailability === true && (
            <Alert
              message="Hotdesk Unavailable"
              description="You cannot reserve hotdesks because you have ignore availability enabled."
              type="warning"
            />
          )}

          {/* Person Assignment Section */}
          {(canReserve || isAdmin) && (
            <div>
              <Descriptions title="Person Assigned:" />
              <Select
                style={{ width: "100%" }}
                showSearch
                placeholder="Choose person"
                optionFilterProp="label"
                value={selectedEmployeeId}
                disabled={!isAdmin}
                onChange={handleEmployeeChange}
                options={availableEmployees.map((person) => ({
                  label: person.name + " " + person.surname,
                  value: person.id,
                }))}
                className={`w-full ${!isAdmin ? "pointer-events-none" : ""} [&_.ant-select-selector]:!text-black [&_.ant-select-selector]:!bg-gray-100 [&_.ant-select-selector]:!opacity-100`}
              />
            </div>
          )}

          {/* Project Assignment Section */}
          {isAdmin && (
            <div>
              <Descriptions title="Project Assigned:" />
              <Select
                showSearch
                placeholder={isHotdesk ? "Select project to convert hotdesk" : "Choose project"}
                value={selectedProjectId}
                disabled={isProjectDisabled}
                optionFilterProp="label"
                onChange={handleProjectChange}
                options={[
                  ...(isTrueAdmin ? [{ label: "Hotdesk", value: "hotdesk" }] : []),
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
              <Descriptions title="Select dates:" />
              <RangePicker
                value={selectedDates}
                onChange={handleDateChange}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
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
                Confirm
              </Button>
            )}
            
            {currentReservation && validateRoles() && (
              <Button
                onClick={handleUnreserve}
                loading={loading}
                style={{ color: "orange", borderColor: "orange" }}
                variant="outlined"
              >
                Delete Reservation
              </Button>
            )}
            
            <Button danger onClick={onClose}>
              {canReserve ? "Cancel" : "Close"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* All Reservations Modal */}
      {showAllReservations && (
        <Modal
          title="All Reservations"
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
                    <Text strong>{reservation.userName}</Text>
                    <br />
                    <Text type="secondary">
                      {dayjs(reservation.startTime).format("MMM DD, YYYY")} - {
                        reservation.endTime ? dayjs(reservation.endTime).format("MMM DD, YYYY") : "Open"
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
                      Delete
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