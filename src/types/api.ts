export interface TicketRequestDTO {
  ticketQueueId?: string;
  ticketPriority?: "NMT" | "ERT" | "PRT";
}

export interface TicketResponseDTO {
  id?: string;
  ticketNum?: number;
  ticketPriority?: "NMT" | "ERT" | "PRT";
  status?:
    | "WAITING ATTENDANT"
    | "WAITING APPOINTMENT"
    | "UNREDEEMED"
    | "SERVED"
    | "CALLED_BY_ATTENDANT"
    | "CALLED_BY_MEDIC";
  ticketQueueId?: string;
  medicId?: string;
  attendantId?: string;
  patientId?: string;
}

export interface TicketRedirectDTO {
  medicId?: string;
  patientId?: string;
}

export interface TicketQueueRequestDTO {
  medicId?: string | null;
  consultationRoom?: number;
}

export interface TicketQueueResponseDTO {
  id?: string;
  date?: string;
  medicId?: string;
  consultationRoom?: number;
}

export interface TicketQueueCallNextRequestDTO {
  ticketQueueId?: string;
  attendantId?: string;
  medicId?: string;
}

export interface ScheduleRequestDTO {
  medicId?: string;
  month?: number;
  year?: number;
  attendanceHourStart?: number;
  attendanceMinuteStart?: number;
  attendanceHourEnd?: number;
  attendanceMinuteEnd?: number;
  lunchHourStart?: number;
  lunchMinuteStart?: number;
  lunchHourEnd?: number;
  lunchMinuteEnd?: number;
  averageTimeForAppointment?: number;
}

export interface ScheduleResponseDTO {
  id?: string;
  medicId?: string;
  month?:
    | "JANUARY"
    | "FEBRUARY"
    | "MARCH"
    | "APRIL"
    | "MAY"
    | "JUNE"
    | "JULY"
    | "AUGUST"
    | "SEPTEMBER"
    | "OCTOBER"
    | "NOVEMBER"
    | "DECEMBER";
  year?: {
    value?: number;
    leap?: boolean;
  };
  numberOfAppointments?: number;
}

export interface PersonRequestDTO {
  name?: string;
  cpf?: string;
  dateOfBirth?: string;
}

export interface PersonResponseDTO {
  id?: string;
  name?: string;
  cpf?: string;
  dateOfBirth?: string;
}

export interface PatientRequestDTO {
  person?: PersonRequestDTO;
}

export interface PatientResponseDTO {
  id?: string;
  person?: PersonResponseDTO;
  membershipId?: string;
}

export interface MedicRequestDTO {
  person?: PersonRequestDTO;
  crm?: string;
  type?: string;
}

export interface MedicResponseDTO {
  id?: string;
  person?: PersonResponseDTO;
  crm?: string;
  type?: string;
}

export interface AttendantRequestDTO {
  person?: PersonRequestDTO;
  ticketWindow?: number;
}

export interface AttendantResponseDTO {
  id?: string;
  person?: PersonResponseDTO;
  ticketWindow?: number;
}

export interface ScheduleAppointmentDTO {
  patientId?: string;
  appointmentId?: string;
}

export interface ScheduledAppointmentDTO {
  date?: string;
  hour?: number;
  minute?: number;
}

export interface LocalTime {
  hour?: number;
  minute?: number;
  second?: number;
  nano?: number;
}

export interface AppointmentResponseDTO {
  id?: string;
  date?: string;
  time?: LocalTime;
  status?: "OPEN" | "SCHEDULED" | "ATTENDED" | "CANCELLED" | "ABSENT PATIENT";
  patientId?: string;
  patientName?: string;
  medicId?: string;
  medicName?: string;
}

export interface AvailableAppointmentTimeDTO {
  id?: string;
  hour?: number;
  minute?: number;
}

export interface GroupedAppointmentsDTO {
  date?: string;
  appointments?: AvailableAppointmentTimeDTO[];
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Current page number (0-indexed)
  first: boolean;
  last: boolean;
  empty: boolean;
}
