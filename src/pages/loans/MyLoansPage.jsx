import { useState, useEffect } from "react";
import loanService from "../../api/loanService";

const statusLabel = {
  ISSUED: { text: "Activo", color: "bg-green-100 text-green-700" },
  OVERDUE: { text: "Vencido", color: "bg-red-100 text-red-700" },
  RETURNED: { text: "Devuelto", color: "bg-gray-100 text-gray-600" },
};

const MyLoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const data = await loanService.getMyLoans();
      setLoans(data);
    } catch (err) {
      console.error("Error cargando préstamos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async (loanId) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await loanService.extend(loanId);
      setLoans(loans.map((l) => (l.id === loanId ? updated : l)));
      setActionSuccess("Préstamo prorrogado correctamente.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Error al prorrogar.");
    }
  };

  const handleReturn = async (loanId) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await loanService.returnBook(loanId);
      setLoans(loans.map((l) => (l.id === loanId ? updated : l)));
      setActionSuccess("Libro devuelto correctamente.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Error al devolver.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando préstamos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis préstamos</h1>

      {actionSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {actionError}
        </div>
      )}

      {loans.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No tienes préstamos.</p>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{loan.bookTitle}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLabel[loan.status]?.color}`}>
                    {statusLabel[loan.status]?.text}
                  </span>
                  <span className="text-xs text-gray-500">
                    Vence: {new Date(loan.dueDate).toLocaleDateString("es-ES")}
                  </span>
                  {loan.returnDate && (
                    <span className="text-xs text-gray-500">
                      Devuelto: {new Date(loan.returnDate).toLocaleDateString("es-ES")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Prórrogas usadas: {loan.extensionsUsed} / 3
                </p>
              </div>

              {/* Acciones */}
              {loan.status !== "RETURNED" && (
                <div className="flex gap-2">
                  {loan.status === "ISSUED" && loan.extensionsUsed < 3 && (
                    <button
                      onClick={() => handleExtend(loan.id)}
                      className="text-sm border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                    >
                      Prorrogar
                    </button>
                  )}
                  <button
                    onClick={() => handleReturn(loan.id)}
                    className="text-sm bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Devolver
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoansPage;