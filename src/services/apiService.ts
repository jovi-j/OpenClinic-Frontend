import {
  TicketRequestDTO,
  TicketResponseDTO,
  TicketQueueRequestDTO,
  TicketQueueResponseDTO,
  ScheduleRequestDTO,
  ScheduleResponseDTO,
  PersonRequestDTO,
  PersonResponseDTO,
  PatientRequestDTO,
  PatientResponseDTO,
  MedicRequestDTO,
  MedicResponseDTO,
  AttendantRequestDTO,
  AttendantResponseDTO,
  ScheduleAppointmentDTO,
  ScheduledAppointmentDTO,
  GroupedAppointmentsDTO,
  AppointmentResponseDTO,
  TicketRedirectDTO,
  Page
} from '../types/api';

// Use environment variable if available
// Otherwise, use the proxy path '/api' which Vite will forward to the backend
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default to using the Vite proxy
  return '/api';
};

const BASE_URL = getBaseUrl();

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }
  if (response.status === 204) {
    return {} as T;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {} as T;
}

const headers = {
  'Content-Type': 'application/json',
};

export const ApiService = {
  getDebugUrl: () => BASE_URL,

  // Tickets
  listTickets: async (): Promise<TicketResponseDTO[]> => {
    const response = await fetch(`${BASE_URL}/tickets`, { method: 'GET', headers });
    return handleResponse<TicketResponseDTO[]>(response);
  },
  createTicket: async (data: TicketRequestDTO): Promise<TicketResponseDTO> => {
    const response = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<TicketResponseDTO>(response);
  },
  deleteTicket: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/tickets/${id}`, { method: 'DELETE', headers });
    return handleResponse<void>(response);
  },
  updateTicket: async (id: string, data: TicketRequestDTO): Promise<TicketResponseDTO> => {
    const response = await fetch(`${BASE_URL}/tickets/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<TicketResponseDTO>(response);
  },
  redirectTicket: async (id: string, data: TicketRedirectDTO): Promise<TicketResponseDTO> => {
    const response = await fetch(`${BASE_URL}/tickets/${id}/redirect`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<TicketResponseDTO>(response);
  },
  completeTicket: async (id: string): Promise<TicketResponseDTO> => {
    const response = await fetch(`${BASE_URL}/tickets/${id}/complete`, {
      method: 'POST',
      headers,
    });
    return handleResponse<TicketResponseDTO>(response);
  },

  // Ticket Queues
  listTicketQueues: async (): Promise<TicketQueueResponseDTO[]> => {
    const response = await fetch(`${BASE_URL}/ticket-queues`, { method: 'GET', headers });
    return handleResponse<TicketQueueResponseDTO[]>(response);
  },
  createTicketQueue: async (data: TicketQueueRequestDTO): Promise<TicketQueueResponseDTO> => {
    const response = await fetch(`${BASE_URL}/ticket-queues`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<TicketQueueResponseDTO>(response);
  },
  callNextTicket: async (queueId: string, attendantId?: string): Promise<TicketResponseDTO> => {
    const url = new URL(`${BASE_URL}/ticket-queues/${queueId}/call-next`, window.location.origin);
    if (attendantId) {
      url.searchParams.append('attendantId', attendantId);
    }
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers
    });
    return handleResponse<TicketResponseDTO>(response);
  },

  // Schedules
  createSchedule: async (data: ScheduleRequestDTO): Promise<ScheduleResponseDTO> => {
    const response = await fetch(`${BASE_URL}/schedules`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<ScheduleResponseDTO>(response);
  },

  // Persons
  listPersons: async (): Promise<PersonResponseDTO[]> => {
    const response = await fetch(`${BASE_URL}/persons`, { method: 'GET', headers });
    return handleResponse<PersonResponseDTO[]>(response);
  },
  createPerson: async (data: PersonRequestDTO): Promise<PersonResponseDTO> => {
    const response = await fetch(`${BASE_URL}/persons`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<PersonResponseDTO>(response);
  },
  deletePerson: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/persons/${id}`, { method: 'DELETE', headers });
    return handleResponse<void>(response);
  },
  updatePerson: async (id: string, data: PersonRequestDTO): Promise<PersonResponseDTO> => {
    const response = await fetch(`${BASE_URL}/persons/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<PersonResponseDTO>(response);
  },

  // Patients
  listPatients: async (): Promise<PatientResponseDTO[]> => {
    const response = await fetch(`${BASE_URL}/patients`, { method: 'GET', headers });
    return handleResponse<PatientResponseDTO[]>(response);
  },
  createPatient: async (data: PatientRequestDTO): Promise<PatientResponseDTO> => {
    const response = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<PatientResponseDTO>(response);
  },
  deletePatient: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/patients/${id}`, { method: 'DELETE', headers });
    return handleResponse<void>(response);
  },
  updatePatient: async (id: string, data: PatientRequestDTO): Promise<PatientResponseDTO> => {
    const response = await fetch(`${BASE_URL}/patients/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<PatientResponseDTO>(response);
  },

  // Medics
  listMedics: async (): Promise<MedicResponseDTO[]> => {
    const response = await fetch(`${BASE_URL}/medics`, { method: 'GET', headers });
    return handleResponse<MedicResponseDTO[]>(response);
  },
  createMedic: async (data: MedicRequestDTO): Promise<MedicResponseDTO> => {
    const response = await fetch(`${BASE_URL}/medics`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<MedicResponseDTO>(response);
  },
  deleteMedic: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/medics/${id}`, { method: 'DELETE', headers });
    return handleResponse<void>(response);
  },
  updateMedic: async (id: string, data: MedicRequestDTO): Promise<MedicResponseDTO> => {
    const response = await fetch(`${BASE_URL}/medics/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<MedicResponseDTO>(response);
  },

  // Attendants
  listAttendants: async (): Promise<AttendantResponseDTO[]> => {
    const response = await fetch(`${BASE_URL}/attendants`, { method: 'GET', headers });
    return handleResponse<AttendantResponseDTO[]>(response);
  },
  createAttendant: async (data: AttendantRequestDTO): Promise<AttendantResponseDTO> => {
    const response = await fetch(`${BASE_URL}/attendants`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<AttendantResponseDTO>(response);
  },
  deleteAttendant: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/attendants/${id}`, { method: 'DELETE', headers });
    return handleResponse<void>(response);
  },
  updateAttendant: async (id: string, data: AttendantRequestDTO): Promise<AttendantResponseDTO> => {
    const response = await fetch(`${BASE_URL}/attendants/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<AttendantResponseDTO>(response);
  },

  // Appointments
  scheduleAppointment: async (data: ScheduleAppointmentDTO): Promise<ScheduledAppointmentDTO> => {
    const response = await fetch(`${BASE_URL}/appointments/scheduleAppointment`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<ScheduledAppointmentDTO>(response);
  },
  getAvailableAppointmentsByMedic: async (medicId: string): Promise<GroupedAppointmentsDTO[]> => {
    const response = await fetch(`${BASE_URL}/appointments/availableByMedic/${medicId}`, { method: 'GET', headers });
    return handleResponse<GroupedAppointmentsDTO[]>(response);
  },
  cancelAppointment: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/appointments/${id}/cancel`, { method: 'PATCH', headers });
    return handleResponse<void>(response);
  },
  searchAppointments: async (
    criteria: { patientId?: string, date?: string, medicId?: string, status?: string },
    page: number = 0,
    size: number = 10
  ): Promise<Page<AppointmentResponseDTO>> => {
    const params = new URLSearchParams();
    if (criteria.patientId) params.append('patientId', criteria.patientId);
    if (criteria.date) params.append('date', criteria.date);
    if (criteria.medicId) params.append('medicId', criteria.medicId);
    if (criteria.status) params.append('status', criteria.status);
    
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await fetch(`${BASE_URL}/appointments/search?${params.toString()}`, { method: 'GET', headers });
    return handleResponse<Page<AppointmentResponseDTO>>(response);
  }
};
