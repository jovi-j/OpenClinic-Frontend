# OpenClinic Frontend

This is a project for getting some experience on the frontend development using React. It is built for the [OpenClinic Hospital Management System](https://github.com/jovi-j/OpenClinic), using React, TypeScript, and Tailwind CSS.

## 🚀 Features

### 👥 Role-Based Access

- **Patient View**: Book appointments, view appointment history, and check live queue status.
- **Medic View**: Manage daily schedule, view assigned patient queue, and call patients.
- **Attendant View**: Create queues, issue tickets, manage general queues, redirect patients to medics, and manage appointments.
- **Administration Mode**: Manage (Create/Edit/Delete) Patients, Medics, and Attendants.

### 🖥️ Kiosk Mode

- Dedicated touch-friendly interface for patients to self-issue tickets.
- Supports "Normal", "Preferential", and "Exam Results" priorities.
- Auto-prints tickets.
- Full-screen support for tablets/kiosks.

### 📺 TV Display Mode

- Real-time display of called tickets for waiting rooms.
- Shows current ticket number, priority, and destination (Consultation Room or Counter).
- History of last 5 called tickets.

### 📅 Appointment Management

- **Scheduling**: Patients can book appointments by selecting a month, day, and time slot.
- **Pagination**: Efficiently browse through appointment history.
- **Filtering**: Filter appointments by date, status, medic, or patient.

### 🎫 Queue Management

- **General Queues**: For initial reception/triage.
- **Medic Queues**: Specific queues for each doctor.
- **Ticket Redirection**: Attendants can redirect a patient from a general queue to a specific medic's queue after triage.

## 🛠️ Technologies Used

- **React 18**: UI Library.
- **TypeScript**: Static typing for reliability.
- **Vite**: Fast build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Fetch API**: For communication with the Spring Boot backend.

## 📋 Prerequisites

- **Node.js**: Version 18 or higher.
- **OpenClinic Backend**: A running instance of the [OpenClinic Spring Boot API](https://github.com/jovi-j/OpenClinic).

## ⚙️ Configuration

The application connects to the backend API. By default, it attempts to connect to `http://localhost:8182`.

To change the backend URL (e.g., for LAN access), edit the `.env` file in the root directory:

```env
VITE_API_URL=http://YOUR_BACKEND_IP:8182
```

## 🚀 Getting Started

1.  **Clone the repository**

    ```bash
    git clone https://github.com/jovi-j/openclinic-frontend.git
    cd openclinic-frontend
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Run the development server**

- **Running on a single computer**
  If you only want to run dev mode on a single device, just run:
  ```bash
  npm run dev
  ```
- **Running on multiple devices**
  To be able to test it on other devices inside your LAN, run:
  ```bash
  npm run dev -- --host
  ```

4.  **Open in Browser**
    - Local: `http://localhost:5173`
    - Network: `http://YOUR_LAN_IP:5173`

## 📱 Usage Guide

1.  **First Launch**: You will see a Role Selection screen.
2.  **Admin Setup**:
    - Go to **Administration Mode**.
    - Create at least one **Medic** and one **Attendant**.
    - Create **Patients** as needed.
3.  **Daily Operation**:
    - **Attendant**: Log in, create a **General Queue** for the day.
    - **Medic**: Log in, create a **Schedule** for the current month to open appointment slots.
    - **Kiosk**: Open Kiosk Mode on a tablet/terminal for patients to get tickets.
    - **Display**: Open TV Display on a large screen in the waiting room.
4.  **Patient Flow**:
    - Patient gets a ticket (Kiosk).
    - Attendant calls ticket (General Queue).
    - Attendant redirects ticket to Medic (if appointment exists).
    - Medic calls ticket (Medic Queue).

## 📄 License

This project is licensed under the MIT License.
