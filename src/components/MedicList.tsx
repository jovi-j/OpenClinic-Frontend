import React, { useEffect, useState } from "react";
import { ApiService } from "../services/apiService";
import type { MedicResponseDTO, MedicRequestDTO } from "../types/api";

const MedicList: React.FC = () => {
  const [medics, setMedics] = useState<MedicResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editingMedic, setEditingMedic] = useState<MedicResponseDTO | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editCpf, setEditCpf] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editCrm, setEditCrm] = useState("");
  const [editType, setEditType] = useState("");

  const fetchMedics = async () => {
    setLoading(true);
    try {
      const data = await ApiService.listMedics();
      setMedics(data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        console.error("Unknown error.", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedics();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this medic? This action cannot be undone.",
      )
    )
      return;
    try {
      await ApiService.deleteMedic(id);
      fetchMedics();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Error deleting medic: ${err.message}`);
      } else {
        console.error("Unknown error.", err);
      }
    }
  };

  const openEditModal = (medic: MedicResponseDTO) => {
    setEditingMedic(medic);
    setEditName(medic.person?.name || "");
    setEditCpf(medic.person?.cpf || "");
    setEditCrm(medic.crm || "");
    setEditType(medic.type || "");

    const dob = medic.person?.dateOfBirth;
    if (dob) {
      const [day, month, year] = dob.split("/");
      setEditDob(`${year}-${month}-${day}`);
    } else {
      setEditDob("");
    }
  };

  const handleUpdate = async () => {
    if (!editingMedic || !editingMedic.id) return;

    const [year, month, day] = editDob.split("-");
    const formattedDob = `${day}/${month}/${year}`;

    const payload: MedicRequestDTO = {
      person: {
        name: editName,
        cpf: editCpf,
        dateOfBirth: formattedDob,
      },
      crm: editCrm,
      type: editType,
    };

    try {
      await ApiService.updateMedic(editingMedic.id, payload);
      setEditingMedic(null);
      fetchMedics();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Error updating medic: ${err.message}`);
      } else {
        console.error("Unknown error.", err);
      }
    }
  };

  if (loading && medics.length === 0)
    return (
      <div className="p-6 text-center text-gray-500">Loading directory...</div>
    );
  if (error)
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="overflow-x-auto relative">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              CRM
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Specialty
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {medics.map((medic) => (
            <tr key={medic.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                    {medic.person?.name?.charAt(0) || "M"}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {medic.person?.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {medic.crm}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                  {medic.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => openEditModal(medic)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(medic.id!)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {medics.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                No medics found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingMedic && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Medic</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CPF
                </label>
                <input
                  type="text"
                  value={editCpf}
                  onChange={(e) => setEditCpf(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CRM
                </label>
                <input
                  type="text"
                  value={editCrm}
                  onChange={(e) => setEditCrm(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specialty
                </label>
                <input
                  type="text"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingMedic(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicList;
