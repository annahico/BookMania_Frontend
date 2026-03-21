import { useState, useEffect } from "react";
import fineService from "../../api/fineService";

const MyFinesPage = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFines = async () => {
      try {
        const data = await fineService.getMyFines();
        setFines(data);
      } catch (err) {
        console.error("Error cargando multas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFines();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando multas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis multas</h1>
      <p className="text-gray-500 text-sm mb-6">
        Las multas son penalizaciones temporales que te impiden hacer reservas.
      </p>

      {fines.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <p className="text-green-700 font-medium">¡Sin multas! 🎉</p>
          <p className="text-green-600 text-sm mt-1">
            No tienes ninguna penalización activa.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {fines.map((fine) => {
            const isActive = fine.penaltyDaysRemaining > 0;
            return (
              <div
                key={fine.id}
                className={`bg-white rounded-xl border p-5 ${
                  isActive ? "border-red-200" : "border-gray-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {fine.bookTitle}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                      <span>Días de retraso: <strong>{fine.daysOverdue}</strong></span>
                      <span>Días de penalización: <strong>{fine.penaltyDays}</strong></span>
                      <span>
                        Bloqueado hasta:{" "}
                        <strong>
                          {new Date(fine.penaltyUntil).toLocaleDateString("es-ES")}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Badge estado */}
                  {isActive ? (
                    <div className="flex-shrink-0 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
                      <p className="text-red-700 font-bold text-lg">
                        {fine.penaltyDaysRemaining}
                      </p>
                      <p className="text-red-500 text-xs">días restantes</p>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                      <p className="text-gray-500 text-xs">Penalización</p>
                      <p className="text-gray-600 font-medium text-sm">cumplida</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyFinesPage;