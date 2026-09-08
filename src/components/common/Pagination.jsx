const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageItems = Array.from({ length: totalPages }, (_, i) => i)
    .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1)
    .reduce((acc, i, idx, arr) => {
      if (idx > 0 && i - arr[idx - 1] > 1) acc.push("...");
      acc.push(i);
      return acc;
    }, []);

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onPageChange(0)} disabled={currentPage === 0}
        aria-label="Primera página"
        className="px-3 py-2 text-sm rounded-xl border border-pink-200 text-pink-700 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">«</button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}
        aria-label="Página anterior"
        className="px-4 py-2 text-sm rounded-xl border border-pink-200 text-pink-700 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Anterior</button>

      {pageItems.map((item, idx) =>
        item === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-400" aria-hidden="true">...</span>
        ) : (
          <button key={item} onClick={() => onPageChange(item)}
            aria-label={`Página ${item + 1}`}
            aria-current={currentPage === item ? "page" : undefined}
            className={`px-4 py-2 text-sm rounded-xl transition-colors ${currentPage === item
              ? "bg-pink-700 text-white font-medium"
              : "border border-pink-200 text-pink-700 hover:bg-pink-50"}`}>
            {item + 1}
          </button>
        )
      )}

      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}
        aria-label="Página siguiente"
        className="px-4 py-2 text-sm rounded-xl border border-pink-200 text-pink-700 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Siguiente</button>
      <button onClick={() => onPageChange(totalPages - 1)} disabled={currentPage === totalPages - 1}
        aria-label="Última página"
        className="px-3 py-2 text-sm rounded-xl border border-pink-200 text-pink-700 hover:bg-pink-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">»</button>
    </nav>
  );
};

export default Pagination;
