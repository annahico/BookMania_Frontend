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
      <div className="max-w-4xl mx-auto">
        <div className="h-8 bg-fuchsia-100 rounded w-48 mb-6 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-fuchsia-100 rounded-xl p-4">
              <div className="bg-fuchsia-100 rounded h-4 w-1/3 mb-2" />
              <div className="bg-fuchsia-100 rounded h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-fuchsia-700 mb-2">Mis multas</h1>
      <p className="text-gray-500 text-sm mb-6">
        Las multas son penalizaciones temporales que te impiden hacer reservas.
      </p>

      {fines.length === 0 ? (
        <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-2xl p-8 text-center">
          <p className="text-fuchsia-600 font-medium">¡Sin multas! 🎉</p>
          <p className="text-fuchsia-400 text-sm mt-1">No tienes ninguna penalización activa.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fines.map((fine) => {
            const isActive = fine.penaltyDaysRemaining > 0;
            return (
              <div key={fine.id}
                className={`bg-white rounded-2xl border p-5 ${isActive ? "border-fuchsia-200" : "border-gray-200"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-fuchsia-700">{fine.bookTitle}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                      <span>Días de retraso: <strong>{fine.daysOverdue}</strong></span>
                      <span>Días de penalización: <strong>{fine.penaltyDays}</strong></span>
                      <span>Bloqueado hasta: <strong>{new Date(fine.penaltyUntil).toLocaleDateString("es-ES")}</strong></span>
                    </div>
                  </div>

                  {isActive ? (
                    <div className="flex-shrink-0 bg-fuchsia-50 border border-fuchsia-200 rounded-xl px-4 py-2 text-center">
                      <p className="text-fuchsia-600 font-bold text-lg">{fine.penaltyDaysRemaining}</p>
                      <p className="text-fuchsia-400 text-xs">días restantes</p>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-center">
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