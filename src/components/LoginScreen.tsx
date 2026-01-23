import React, { useState, useEffect } from "react";
import { ApiService } from "../services/apiService";
import type { User } from "../types/user";

type UserType = "PATIENT" | "MEDIC" | "ATTENDANT";

interface LoginScreenProps {
  type: UserType;
  onLogin: (user: User) => void;
  onBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ type, onLogin, onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let data: User[] = [];
        if (type === "PATIENT") data = await ApiService.listPatients();
        if (type === "MEDIC") data = await ApiService.listMedics();
        if (type === "ATTENDANT") data = await ApiService.listAttendants();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  const filteredUsers = users.filter(
    (u) =>
      u.person?.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.person?.cpf?.includes(search) ||
      (u.crm && u.crm.includes(search)),
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {type === "PATIENT"
              ? "Patient Login"
              : type === "MEDIC"
                ? "Medic Login"
                : "Attendant Login"}
          </h2>
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by Name, CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onLogin(user)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all group"
              >
                <div className="font-semibold text-gray-800 group-hover:text-blue-700">
                  {user.person?.name}
                </div>
                <div className="text-sm text-gray-500">
                  {type === "MEDIC" && `CRM: ${user.crm} - ${user.type}`}
                  {type === "ATTENDANT" && `Window: ${user.ticketWindow}`}
                  {type === "PATIENT" && `CPF: ${user.person?.cpf}`}
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
