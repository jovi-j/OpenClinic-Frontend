import React, { useState } from 'react';
import TicketList from './components/TicketList';
import CreateTicketForm from './components/CreateTicketForm';
import CreateTicketQueueForm from './components/CreateTicketQueueForm';
import CreateScheduleForm from './components/CreateScheduleForm';
import AppointmentScheduler from './components/AppointmentScheduler';
import AppointmentList from './components/AppointmentList';
import KioskMode from './components/KioskMode';
import TicketDisplay from './components/TicketDisplay';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import { PatientResponseDTO, MedicResponseDTO, AttendantResponseDTO } from './types/api';

type Role = 'PATIENT' | 'MEDIC' | 'ATTENDANT' | 'KIOSK' | 'DISPLAY' | 'ADMIN' | null;

function App() {
  const [role, setRole] = useState<Role>(null);
  const [currentUser, setCurrentUser] = useState<any>(null); // Stores the logged-in user object

  // 1. Kiosk & Display Modes (No Login Required)
  if (role === 'KIOSK') return <KioskMode onExit={() => setRole(null)} />;
  if (role === 'DISPLAY') return <TicketDisplay onExit={() => setRole(null)} />;
  if (role === 'ADMIN') return <AdminDashboard onExit={() => setRole(null)} />;

  // 2. Role Selection Screen
  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">OpenClinic</h1>
          <p className="text-gray-500 mb-8">Select your role to continue</p>
          
          <div className="space-y-4">
            <button onClick={() => setRole('PATIENT')} className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors flex items-center justify-center">
              <span className="mr-2">👤</span> I am a Patient
            </button>
            <button onClick={() => setRole('MEDIC')} className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg border border-purple-200 transition-colors flex items-center justify-center">
              <span className="mr-2">👨‍⚕️</span> I am a Medic
            </button>
            <button onClick={() => setRole('ATTENDANT')} className="w-full py-3 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold rounded-lg border border-orange-200 transition-colors flex items-center justify-center">
              <span className="mr-2">📋</span> I am an Attendant
            </button>
            
            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 gap-2">
              <button onClick={() => setRole('ADMIN')} className="py-2 px-4 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
                ⚙️ Administration Mode
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setRole('KIOSK')} className="py-2 px-4 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
                  🖥️ Kiosk Mode
                </button>
                <button onClick={() => setRole('DISPLAY')} className="py-2 px-4 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
                  📺 TV Display
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Login Screen (If role selected but no user logged in)
  if (!currentUser) {
    return (
      <LoginScreen 
        type={role as 'PATIENT' | 'MEDIC' | 'ATTENDANT'} 
        onLogin={(user) => setCurrentUser(user)}
        onBack={() => setRole(null)}
      />
    );
  }

  // 4. Main Dashboard (Logged In)
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight mr-4">OpenClinic</h1>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded text-white uppercase">
              {role} VIEW
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Hello, {currentUser.person?.name}
            </span>
            <button 
              onClick={() => { setCurrentUser(null); setRole(null); }}
              className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-10 space-y-12">
        
        {/* PATIENT DASHBOARD */}
        {role === 'PATIENT' && (
          <>
            <section>
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-800">My Health</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-700">Book Appointment</h3>
                   </div>
                   {/* Pass logged-in patient ID to scheduler */}
                  <AppointmentScheduler patientId={currentUser.id} />
                </div>
                {/* Removed "Get a Ticket" section for patients as requested */}
              </div>
            </section>

            <section>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-700">My Appointments</h3>
                </div>
                <div className="p-6">
                  <AppointmentList role="PATIENT" patientId={currentUser.id} />
                </div>
              </div>
            </section>
          </>
        )}

        {/* MEDIC DASHBOARD */}
        {role === 'MEDIC' && (
          <>
            <section>
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-purple-600 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-800">My Schedule</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-700">Define Availability</h3>
                  </div>
                  <CreateScheduleForm medicId={currentUser.id} />
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-700">My Patients (Queue)</h3>
                  </div>
                  <TicketList role="MEDIC" medicId={currentUser.id} />
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-700">My Appointments</h3>
                </div>
                <div className="p-6">
                  <AppointmentList role="MEDIC" medicId={currentUser.id} />
                </div>
              </div>
            </section>
          </>
        )}

        {/* ATTENDANT DASHBOARD */}
        {role === 'ATTENDANT' && (
          <>
            <section>
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-orange-600 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-800">Reception Desk</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-1 space-y-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-700">Create Queue</h3>
                    </div>
                    <CreateTicketQueueForm />
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-700">Issue Ticket</h3>
                    </div>
                    <CreateTicketForm />
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-700">Queue Management</h3>
                    </div>
                    <TicketList role="ATTENDANT" attendantId={currentUser.id} />
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8">
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-700">Appointment Management</h3>
                 </div>
                 <div className="p-6">
                   <AppointmentList role="ATTENDANT" />
                 </div>
                 <div className="border-t border-gray-100">
                   <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-700">Schedule New Appointment</h3>
                   </div>
                   <AppointmentScheduler />
                 </div>
              </div>
            </section>
          </>
        )}

      </main>

      <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} OpenClinic System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
