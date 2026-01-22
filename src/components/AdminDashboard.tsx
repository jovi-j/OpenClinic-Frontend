import React, { useState } from "react";
import RegisterPatientForm from "./RegisterPatientForm";
import RegisterMedicForm from "./RegisterMedicForm";
import RegisterAttendantForm from "./RegisterAttendantForm";
import PatientList from "./PatientList";
import MedicList from "./MedicList";
import AttendantList from "./AttendantList";

const AdminDashboard: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<
    "PATIENTS" | "MEDICS" | "ATTENDANTS"
  >("PATIENTS");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Administration Mode</h1>
          <button
            onClick={onExit}
            className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
          >
            Exit Admin
          </button>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("PATIENTS")}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === "PATIENTS" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          >
            Manage Patients
          </button>
          <button
            onClick={() => setActiveTab("MEDICS")}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === "MEDICS" ? "bg-purple-600 text-white" : "bg-white text-gray-700"}`}
          >
            Manage Medics
          </button>
          <button
            onClick={() => setActiveTab("ATTENDANTS")}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === "ATTENDANTS" ? "bg-orange-600 text-white" : "bg-white text-gray-700"}`}
          >
            Manage Attendants
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Creation Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">Create New</h3>
              </div>
              {activeTab === "PATIENTS" && <RegisterPatientForm />}
              {activeTab === "MEDICS" && <RegisterMedicForm />}
              {activeTab === "ATTENDANTS" && <RegisterAttendantForm />}
            </div>
          </div>

          {/* List View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">Directory</h3>
              </div>
              {activeTab === "PATIENTS" && <PatientList />}
              {activeTab === "MEDICS" && <MedicList />}
              {activeTab === "ATTENDANTS" && <AttendantList />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
