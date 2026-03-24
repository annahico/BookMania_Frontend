/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import adminService from "../../api/adminService";
import bookService from "../../api/bookService";
import ConfirmModal from "../../components/common/ConfirmModal";
import useToast from "../../hooks/useToast";

const TABS = ["Préstamos", "Multas", "Reservas", "Libros", "Categorías"];
const PAGE_SIZE = 15;

const statusLoanLabel = {
  ISSUED: { text: "Activo", color: "bg-green-100 text-green-700" },
  OVERDUE: { text: "Vencido", color: "bg-red-100 text-red-700" },
  RETURNED: { text: "Devuelto", color: "bg-gray-100 text-gray-600" },
};

const statusReservationLabel = {
  PENDING: { text: "En cola", color: "bg-yellow-100 text-yellow-700" },
  FULFILLED: { text: "Cumplida", color: "bg-green-100 text-green-700" },
  CANCELLED: { text: "Cancelada", color: "bg-gray-100 text-gray-600" },
  EXPIRED: { text: "Expirada", color: "bg-red-100 text-red-700" },
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onPageChange(0)} disabled={currentPage === 0}
        className="px-3 py-2 text-sm rounded-xl border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-30 disabled:cursor-not-allowed">«</button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}
        className="px-4 py-2 text-sm rounded-xl border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-30 disabled:cursor-not-allowed">Anterior</button>
      {Array.from({ length: totalPages }, (_, i) => i)
        .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1)
        .reduce((acc, i, idx, arr) => {
          if (idx > 0 && i - arr[idx - 1] > 1) acc.push("...");
          acc.push(i);
          return acc;
        }, [])
        .map((item, idx) =>
          item === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
          ) : (
            <button key={item} onClick={() => onPageChange(item)}
              className={`px-4 py-2 text-sm rounded-xl transition-colors ${currentPage === item
                ? "bg-fuchsia-500 text-white font-medium"
                : "border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50"}`}>
              {item + 1}
            </button>
          )
        )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}
        className="px-4 py-2 text-sm rounded-xl border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-30 disabled:cursor-not-allowed">Siguiente</button>
      <button onClick={() => onPageChange(totalPages - 1)} disabled={currentPage === totalPages - 1}
        className="px-3 py-2 text-sm rounded-xl border border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-30 disabled:cursor-not-allowed">»</button>
    </div>
  );
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("Préstamos");
  const [loans, setLoans] = useState([]);
  const [fines, setFines] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, message: "", onConfirm: null });
  const { showToast } = useToast();

  const [loanSearch, setLoanSearch] = useState("");
  const [loanPage, setLoanPage] = useState(0);
  const [fineSearch, setFineSearch] = useState("");
  const [finePage, setFinePage] = useState(0);
  const [reservationSearch, setReservationSearch] = useState("");
  const [reservationPage, setReservationPage] = useState(0);
  const [bookSearch, setBookSearch] = useState("");
  const [bookPage, setBookPage] = useState(0);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryPage, setCategoryPage] = useState(0);

  const [bookForm, setBookForm] = useState({
    title: "", author: "", isbn: "", publishYear: "", pages: "",
    coverUrl: "", totalCopies: 1, categoryIds: [],
  });
  const [editingBookId, setEditingBookId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [loansData, finesData, reservationsData, booksData, categoriesData] = await Promise.all([
        adminService.getAllLoans(),
        adminService.getAllFines(),
        adminService.getAllReservations(),
        bookService.getAll({ size: 1000 }),
        bookService.getCategories(),
      ]);
      setLoans(loansData);
      setFines(finesData);
      setReservations(reservationsData);
      setBooks(booksData.content);
      setCategories(categoriesData);
    } catch (err) {
      showToast("Error cargando datos del panel", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirm = (message, onConfirm) => setModal({ open: true, message, onConfirm });

  const paginate = (items, page) => items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = (items) => Math.ceil(items.length / PAGE_SIZE);

  const filteredLoans = loans.filter((l) =>
    l.bookTitle?.toLowerCase().includes(loanSearch.toLowerCase()) ||
    l.userName?.toLowerCase().includes(loanSearch.toLowerCase())
  );
  const filteredFines = fines.filter((f) =>
    f.bookTitle?.toLowerCase().includes(fineSearch.toLowerCase()) ||
    f.userName?.toLowerCase().includes(fineSearch.toLowerCase())
  );
  const filteredReservations = reservations.filter((r) =>
    r.bookTitle?.toLowerCase().includes(reservationSearch.toLowerCase()) ||
    r.userName?.toLowerCase().includes(reservationSearch.toLowerCase())
  );
  const filteredBooks = books.filter((b) =>
    b.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.author?.toLowerCase().includes(bookSearch.toLowerCase())
  );
  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...bookForm,
        publishYear: bookForm.publishYear ? parseInt(bookForm.publishYear) : null,
        totalCopies: parseInt(bookForm.totalCopies),
        pages: bookForm.pages ? parseInt(bookForm.pages) : null,
        categoryIds: bookForm.categoryIds.map(Number),
      };
      if (editingBookId) {
        await adminService.updateBook(editingBookId, payload);
        showToast("Libro actualizado correctamente", "success");
      } else {
        await adminService.createBook(payload);
        showToast("Libro creado correctamente", "success");
      }
      setBookForm({ title: "", author: "", isbn: "", pages: "", publishYear: "", coverUrl: "", totalCopies: 1, categoryIds: [] });
      setEditingBookId(null);
      const booksData = await bookService.getAll({ size: 1000 });
      setBooks(booksData.content);
    } catch (err) {
      showToast(err.response?.data?.message || "Error al guardar el libro", "error");
    }
  };

  const handleEditBook = (book) => {
    setEditingBookId(book.id);
    setBookForm({
      title: book.title, author: book.author, isbn: book.isbn,
      publishYear: book.publishYear || "", coverUrl: book.coverUrl || "",
      totalCopies: book.totalCopies, pages: book.pages || "",
      categoryIds: categories.filter((c) => book.categories?.includes(c.name)).map((c) => c.id),
    });
    setActiveTab("Libros");
    window.scrollTo(0, 0);
  };

  const handleDeleteBook = (id) => {
    confirm("¿Eliminar este libro? Esta acción no se puede deshacer.", async () => {
      setModal({ open: false });
      try {
        await adminService.deleteBook(id);
        setBooks((prev) => prev.filter((b) => b.id !== id));
        showToast("Libro eliminado correctamente", "success");
      } catch (err) {
        showToast(err.response?.data?.message || "Error al eliminar", "error");
      }
    });
  };

  const handleDeleteFine = (id) => {
    confirm("¿Anular esta multa? Se eliminará la penalización del usuario.", async () => {
      setModal({ open: false });
      try {
        await adminService.deleteFine(id);
        setFines((prev) => prev.filter((f) => f.id !== id));
        showToast("Multa anulada correctamente", "success");
      } catch (err) {
        showToast(err.response?.data?.message || "Error al anular", "error");
      }
    });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await adminService.updateCategory(editingCategoryId, categoryForm);
        showToast("Categoría actualizada correctamente", "success");
      } else {
        await adminService.createCategory(categoryForm);
        showToast("Categoría creada correctamente", "success");
      }
      setCategoryForm({ name: "", description: "" });
      setEditingCategoryId(null);
      setCategories(await bookService.getCategories());
    } catch (err) {
      showToast(err.response?.data?.message || "Error al guardar la categoría", "error");
    }
  };

  const handleDeleteCategory = (id) => {
    confirm("¿Eliminar esta categoría?", async () => {
      setModal({ open: false });
      try {
        await adminService.deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        showToast("Categoría eliminada correctamente", "success");
      } catch (err) {
        showToast(err.response?.data?.message || "Error al eliminar", "error");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-fuchsia-400">Cargando panel de administración...</p>
      </div>
    );
  }

  const inputClass = "border border-fuchsia-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 bg-white w-full";
  const searchClass = "border border-fuchsia-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 bg-white w-full mb-4";
  const btnPrimary = "bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-medium px-6 py-2 rounded-xl text-sm transition-colors";
  const btnSecondary = "border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-xl text-sm transition-colors";
  const btnEdit = "text-sm border border-fuchsia-400 text-fuchsia-600 hover:bg-fuchsia-50 px-3 py-1.5 rounded-xl transition-colors";
  const btnDelete = "text-sm border border-red-400 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors";

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-fuchsia-700 mb-6">Panel de administración</h1>

      <div className="flex gap-2 mb-8 border-b border-fuchsia-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
              ? "border-fuchsia-500 text-fuchsia-600"
              : "border-transparent text-gray-500 hover:text-fuchsia-500"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Préstamos ── */}
      {activeTab === "Préstamos" && (
        <div>
          <input type="text" placeholder="Buscar por libro o usuario..." value={loanSearch}
            onChange={(e) => { setLoanSearch(e.target.value); setLoanPage(0); }}
            className={searchClass} />
          <p className="text-sm text-gray-500 mb-4">
            {filteredLoans.length} préstamos
            {totalPages(filteredLoans) > 1 && ` · Página ${loanPage + 1} de ${totalPages(filteredLoans)}`}
          </p>
          <div className="space-y-3">
            {filteredLoans.length === 0 && <p className="text-gray-400 text-center py-8">No hay préstamos.</p>}
            {paginate(filteredLoans, loanPage).map((loan) => (
              <div key={loan.id} className="bg-white border border-fuchsia-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-fuchsia-700">{loan.bookTitle}</p>
                  <p className="text-sm text-gray-600">{loan.userName}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                    <span>Vence: {new Date(loan.dueDate).toLocaleDateString("es-ES")}</span>
                    {loan.returnDate && <span>Devuelto: {new Date(loan.returnDate).toLocaleDateString("es-ES")}</span>}
                    <span>Prórrogas: {loan.extensionsUsed}/3</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium self-start sm:self-center ${statusLoanLabel[loan.status]?.color}`}>
                  {statusLoanLabel[loan.status]?.text}
                </span>
              </div>
            ))}
          </div>
          <Pagination currentPage={loanPage} totalPages={totalPages(filteredLoans)} onPageChange={setLoanPage} />
        </div>
      )}

      {/* ── Multas ── */}
      {activeTab === "Multas" && (
        <div>
          <input type="text" placeholder="Buscar por libro o usuario..." value={fineSearch}
            onChange={(e) => { setFineSearch(e.target.value); setFinePage(0); }}
            className={searchClass} />
          <p className="text-sm text-gray-500 mb-4">
            {filteredFines.length} multas
            {totalPages(filteredFines) > 1 && ` · Página ${finePage + 1} de ${totalPages(filteredFines)}`}
          </p>
          <div className="space-y-3">
            {filteredFines.length === 0 && <p className="text-gray-400 text-center py-8">No hay multas.</p>}
            {paginate(filteredFines, finePage).map((fine) => (
              <div key={fine.id} className="bg-white border border-fuchsia-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-fuchsia-700">{fine.bookTitle}</p>
                  <p className="text-sm text-gray-600">{fine.userName}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                    <span>Retraso: <strong>{fine.daysOverdue} días</strong></span>
                    <span>Penalización: <strong>{fine.penaltyDays} días</strong></span>
                    <span>Hasta: <strong>{new Date(fine.penaltyUntil).toLocaleDateString("es-ES")}</strong></span>
                  </div>
                </div>
                <button onClick={() => handleDeleteFine(fine.id)} className={btnDelete}>Anular</button>
              </div>
            ))}
          </div>
          <Pagination currentPage={finePage} totalPages={totalPages(filteredFines)} onPageChange={setFinePage} />
        </div>
      )}

      {/* ── Reservas ── */}
      {activeTab === "Reservas" && (
        <div>
          <input type="text" placeholder="Buscar por libro o usuario..." value={reservationSearch}
            onChange={(e) => { setReservationSearch(e.target.value); setReservationPage(0); }}
            className={searchClass} />
          <p className="text-sm text-gray-500 mb-4">
            {filteredReservations.length} reservas
            {totalPages(filteredReservations) > 1 && ` · Página ${reservationPage + 1} de ${totalPages(filteredReservations)}`}
          </p>
          <div className="space-y-3">
            {filteredReservations.length === 0 && <p className="text-gray-400 text-center py-8">No hay reservas.</p>}
            {paginate(filteredReservations, reservationPage).map((r) => (
              <div key={r.id} className="bg-white border border-fuchsia-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-fuchsia-700">{r.bookTitle}</p>
                  <p className="text-sm text-gray-600">{r.userName} — posición {r.queuePosition}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.reservationDate).toLocaleDateString("es-ES")}
                    {r.expiryDate && ` · Expira: ${new Date(r.expiryDate).toLocaleDateString("es-ES")}`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium self-start sm:self-center ${statusReservationLabel[r.status]?.color}`}>
                  {statusReservationLabel[r.status]?.text}
                </span>
              </div>
            ))}
          </div>
          <Pagination currentPage={reservationPage} totalPages={totalPages(filteredReservations)} onPageChange={setReservationPage} />
        </div>
      )}

      {/* ── Libros ── */}
      {activeTab === "Libros" && (
        <div>
          <div className="bg-white border border-fuchsia-100 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-fuchsia-700 mb-4">
              {editingBookId ? "Editar libro" : "Añadir nuevo libro"}
            </h2>
            <form onSubmit={handleBookSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input className={inputClass} type="text" placeholder="Título *" required
                value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} />
              <input className={inputClass} type="text" placeholder="Autor *" required
                value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} />
              <input className={inputClass} type="text" placeholder="ISBN *" required
                value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} />
              <input className={inputClass} type="number" placeholder="Número de páginas" min={1}
                value={bookForm.pages} onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })} />
              <input className={inputClass} type="number" placeholder="Año de publicación"
                value={bookForm.publishYear} onChange={(e) => setBookForm({ ...bookForm, publishYear: e.target.value })} />
              <input className={inputClass} type="text" placeholder="URL portada"
                value={bookForm.coverUrl} onChange={(e) => setBookForm({ ...bookForm, coverUrl: e.target.value })} />
              <input className={inputClass} type="number" placeholder="Copias totales *" required min={1}
                value={bookForm.totalCopies} onChange={(e) => setBookForm({ ...bookForm, totalCopies: e.target.value })} />
              <div className="sm:col-span-2">
                <p className="text-sm text-fuchsia-600 font-medium mb-2">Categorías *</p>
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox"
                        checked={bookForm.categoryIds.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBookForm({ ...bookForm, categoryIds: [...bookForm.categoryIds, cat.id] });
                          } else {
                            setBookForm({ ...bookForm, categoryIds: bookForm.categoryIds.filter((id) => id !== cat.id) });
                          }
                        }} className="rounded accent-fuchsia-500" />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" className={btnPrimary}>
                  {editingBookId ? "Actualizar" : "Crear libro"}
                </button>
                {editingBookId && (
                  <button type="button" className={btnSecondary}
                    onClick={() => { setEditingBookId(null); setBookForm({ title: "", author: "", isbn: "", pages: "", publishYear: "", coverUrl: "", totalCopies: 1, categoryIds: [] }); }}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <input type="text" placeholder="Buscar por título o autor..." value={bookSearch}
            onChange={(e) => { setBookSearch(e.target.value); setBookPage(0); }}
            className={searchClass} />
          <p className="text-sm text-gray-500 mb-4">
            {filteredBooks.length} libros
            {totalPages(filteredBooks) > 1 && ` · Página ${bookPage + 1} de ${totalPages(filteredBooks)}`}
          </p>
          <div className="space-y-3">
            {filteredBooks.length === 0 && <p className="text-gray-400 text-center py-8">No hay libros.</p>}
            {paginate(filteredBooks, bookPage).map((book) => (
              <div key={book.id} className="bg-white border border-fuchsia-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-fuchsia-700">{book.title}</p>
                  <p className="text-sm text-gray-500">{book.author}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {book.categories?.map((cat) => (
                      <span key={cat} className="text-xs bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100 px-2 py-0.5 rounded-full">{cat}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Copias: {book.availableCopies}/{book.totalCopies}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEditBook(book)} className={btnEdit}>Editar</button>
                  <button onClick={() => handleDeleteBook(book.id)} className={btnDelete}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={bookPage} totalPages={totalPages(filteredBooks)} onPageChange={setBookPage} />
        </div>
      )}

      {/* ── Categorías ── */}
      {activeTab === "Categorías" && (
        <div>
          <div className="bg-white border border-fuchsia-100 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-fuchsia-700 mb-4">
              {editingCategoryId ? "Editar categoría" : "Nueva categoría"}
            </h2>
            <form onSubmit={handleCategorySubmit} className="flex gap-3 flex-wrap">
              <input type="text" placeholder="Nombre *" required value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="flex-1 min-w-[150px] border border-fuchsia-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 bg-white" />
              <input type="text" placeholder="Descripción" value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="flex-1 min-w-[150px] border border-fuchsia-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 bg-white" />
              <button type="submit" className={btnPrimary}>
                {editingCategoryId ? "Actualizar" : "Crear"}
              </button>
              {editingCategoryId && (
                <button type="button" className={btnSecondary}
                  onClick={() => { setEditingCategoryId(null); setCategoryForm({ name: "", description: "" }); }}>
                  Cancelar
                </button>
              )}
            </form>
          </div>

          <input type="text" placeholder="Buscar categoría..." value={categorySearch}
            onChange={(e) => { setCategorySearch(e.target.value); setCategoryPage(0); }}
            className={searchClass} />
          <p className="text-sm text-gray-500 mb-4">
            {filteredCategories.length} categorías
            {totalPages(filteredCategories) > 1 && ` · Página ${categoryPage + 1} de ${totalPages(filteredCategories)}`}
          </p>
          <div className="space-y-3">
            {filteredCategories.length === 0 && <p className="text-gray-400 text-center py-8">No hay categorías.</p>}
            {paginate(filteredCategories, categoryPage).map((cat) => (
              <div key={cat.id} className="bg-white border border-fuchsia-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-fuchsia-700">{cat.name}</p>
                  {cat.description && <p className="text-sm text-gray-500">{cat.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingCategoryId(cat.id); setCategoryForm({ name: cat.name, description: cat.description || "" }); window.scrollTo(0, 0); }}
                    className={btnEdit}>Editar</button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className={btnDelete}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={categoryPage} totalPages={totalPages(filteredCategories)} onPageChange={setCategoryPage} />
        </div>
      )}

      {modal.open && (
        <ConfirmModal message={modal.message} onConfirm={modal.onConfirm}
          onCancel={() => setModal({ open: false })} />
      )}
    </div>
  );
};

export default AdminPage;