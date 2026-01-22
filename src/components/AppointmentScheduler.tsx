import React, { useState, useEffect, useRef } from "react";
import { ApiService } from "../services/apiService";
import type { GroupedAppointmentsDTO, MedicResponseDTO } from "../types/api";
import { getDaysForMonth, getSlotsForDay } from "../helpers/helpers";
import MonthSelector from "./MonthSelector";
import DaySelector from "./DaySelector";
import TimeSelector from "./TimeSelector";
import MessageDisplay, { type MessageType } from "./UI/MessageDisplay";

interface AppointmentSchedulerProps {
  patientId?: string; // If provided (e.g. logged in patient), pre-select and hide search
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  patientId: propPatientId,
}) => {
  // Data for search
  const [allMedics, setAllMedics] = useState<MedicResponseDTO[]>([]);

  // Selection states
  const [medicId, setMedicId] = useState("");

  // Search inputs
  const [medicSearch, setMedicSearch] = useState("");

  // UI states
  const [showMedicOptions, setShowMedicOptions] = useState(false);
  const [doctorAvaliableSlots, setDoctorAvaliableSlots] = useState<
    GroupedAppointmentsDTO[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageType | null>(null);
  const [selectedSlotId, setSelectedTimeSlotId] = useState<string | null>(null);

  // New UI States for Month/Day selection
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // Format: YYYY-MM
  const [selectedDay, setSelectedDay] = useState<string | undefined>(""); // Format: YYYY-MM-DD

  // Refs for clicking outside
  const medicWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load directories for search
    const loadMedicsAndPatients = async () => {
      try {
        const [medicsData] = await Promise.all([
          ApiService.listMedics(),
          ApiService.listPatients(),
        ]);
        setAllMedics(medicsData);
      } catch (err) {
        console.error("Failed to load directories", err);
      }
    };
    loadMedicsAndPatients();

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (
        medicWrapperRef.current &&
        !medicWrapperRef.current.contains(event.target as Node)
      ) {
        setShowMedicOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter logic
  const filteredMedics = allMedics.filter((m) => {
    const search = medicSearch.toLowerCase();
    return (
      m.person?.name?.toLowerCase().includes(search) ||
      m.crm?.toLowerCase().includes(search) ||
      m.type?.toLowerCase().includes(search)
    );
  });

  const fetchMedicAvaliableSlots = async (id: string) => {
    if (!id) return;

    setLoading(true);
    setDoctorAvaliableSlots([]);
    setSelectedTimeSlotId(null);
    setSelectedMonth("");
    setSelectedDay("");

    try {
      const data = await ApiService.getAvailableAppointmentsByMedic(id);
      setDoctorAvaliableSlots(data);
      if (data.length === 0) {
        setMessage({
          type: "info",
          text: "No available slots found for this medic.",
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({
          type: "error",
          text: `Error fetching slots: ${err.message}`,
        });
      } else {
        console.error("Unknown error.", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMedicSelect = (medic: MedicResponseDTO) => {
    setMedicId(medic.id || "");
    setMedicSearch(medic.person?.name || "");
    setShowMedicOptions(false);
    if (medic.id) {
      fetchMedicAvaliableSlots(medic.id);
    }
  };

  const handleSchedule = async () => {
    if (!selectedSlotId || !propPatientId) {
      setMessage({ type: "error", text: "Please select a slot and a Patient" });
      return;
    }

    try {
      const result = await ApiService.scheduleAppointment({
        patientId: propPatientId,
        appointmentId: selectedSlotId,
      });

      const date = new Date(
        `${result.date}T${result.hour?.toString().padStart(2, "0")}:${result.minute?.toString().padStart(2, "0")}:00`,
      );
      const formattedDate = date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessage({
        type: "success",
        text: `Appointment scheduled successfully for ${formattedDate} at ${formattedTime}`,
      });
      // Refresh slots
      if (medicId) fetchMedicAvaliableSlots(medicId);
      setSelectedTimeSlotId(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({
          type: "error",
          text: `Error scheduling appointment: ${err.message}`,
        });
      } else {
        console.error("Unknown error.", err);
      }
    }
  };

  // Helper to get available months (current + next 2)
  const getAvailableMonths = () => {
    const months = new Set<string>();
    const today = new Date();
    const limit = new Date();
    limit.setMonth(today.getMonth() + 3); // Current + 2 next months (approx)

    doctorAvaliableSlots.forEach((group) => {
      if (!group.date) return;
      const date = new Date(group.date);
      if (date >= today && date < limit) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        months.add(monthKey);
      }
    });
    return Array.from(months).sort();
  };

  const handleDayClick = (groupDate: string | undefined) => {
    setSelectedDay(groupDate);
    setSelectedTimeSlotId(null);
  };

  const handleMonthClick = (month: string) => {
    setSelectedMonth(month);
    setSelectedDay("");
    setSelectedTimeSlotId(null);
  };

  const handleTimeClick = (slotId: string | null) => {
    setSelectedTimeSlotId(slotId || null);
  };
  const handleCloseMessage = () => {
    setMessage(null);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Medic Search */}
        <div className="flex-1 relative" ref={medicWrapperRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Find Medic
          </label>
          <div className="relative">
            <input
              type="text"
              value={medicSearch}
              onChange={(e) => {
                setMedicSearch(e.target.value);
                setMedicId("");
                setShowMedicOptions(true);
                setDoctorAvaliableSlots([]);
                setSelectedMonth("");
                setSelectedDay("");
              }}
              onFocus={() => setShowMedicOptions(true)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
              placeholder="Search by Name, CRM or Specialty..."
            />
            {loading && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {showMedicOptions && medicSearch && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {filteredMedics.length > 0 ? (
                filteredMedics.map((medic) => (
                  <div
                    key={medic.id}
                    onClick={() => handleMedicSelect(medic)}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900"
                  >
                    <div className="flex items-center">
                      <span className="font-medium block truncate">
                        {medic.person?.name}
                      </span>
                      <span className="text-gray-500 ml-2 text-xs">
                        ({medic.type}) - CRM: {medic.crm}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-700">
                  No medics found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {doctorAvaliableSlots.length > 0 && (
        <MonthSelector
          avaliableMonths={getAvailableMonths()}
          handleMonthClick={handleMonthClick}
          selectedMonth={selectedMonth}
        />
      )}

      <div className="flex flex-row">
        {selectedMonth && (
          <DaySelector
            avaliableDates={getDaysForMonth({
              availableSlots: doctorAvaliableSlots,
              selectedMonth,
            })}
            selectedDay={selectedDay}
            handleChangeDay={handleDayClick}
          />
        )}

        {selectedDay && (
          <TimeSelector
            avaliableSlots={getSlotsForDay({
              availableSlots: doctorAvaliableSlots,
              selectedDay,
            })}
            selectedSlotId={selectedSlotId}
            handleSlotTimeClick={handleTimeClick}
          />
        )}
      </div>

      {selectedSlotId && (
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-start">
          <button
            onClick={handleSchedule}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Confirm Appointment
          </button>
        </div>
      )}

      {message && (
        <MessageDisplay message={message} onClose={handleCloseMessage} />
      )}
    </div>
  );
};

export default AppointmentScheduler;
