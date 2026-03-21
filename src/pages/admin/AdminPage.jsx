import { useState, useEffect } from "react";
import adminService from "../../api/adminService";
import bookService from "../../api/bookService";
import ConfirmModal from "../../components/common/ConfirmModal";

const TABS = ["Préstamos", "Multas", "Reservas", "Libros", "Categorías"];

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

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("Préstamos");
  const [loans, setLoans] = useState([]);
  const [fines, setFines] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, message: "", onConfirm: null });

  const [bookForm, setBookForm] = useState({
    title: "", author: "", isbn: "", publishYear: "",
    coverUrl: "", totalCopies: 1, categoryIds: [],
  });
  const [editingBookId, setEditingBookId] = useState(null);
  const [bookSuccess, setBookSuccess] = useState(null);
  const [bookError, setBookError] = useState(null);

  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categorySuccess, setCategorySuccess] = useState(null);
  const [categoryError, setCategoryError] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [loansData, finesData, reservationsData, booksData, categoriesData] = await Promise.all([
        adminService.getAllLoans(),
        adminService.getAllFines(),
        adminService.getAllReservations(),
        bookService.getAll(),
        bookService.getCategories(),
      ]);
      setLoans(loansData);
      setFines(finesData);
      setReservations(reservationsData);
      setBooks(booksData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error cargando datos admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirm = (message, onConfirm) => {
    setModal({ open: true, message, onConfirm });
  };

  // ── Libros ──────────────────────────────────────────────────────────────
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookError(null);
    setBookSuccess(null);
    try {
      const payload = {
        ...bookForm,
        publishYear: bookForm.publishYear ? parseInt(bookForm.publishYear) : null,
        totalCopies: parseInt(bookForm.totalCopies),
        categoryIds: bookForm.categoryIds.map(Number),
      };
      if (editingBookId) {
        await adminService.updateBook(editingBookId, payload);
        setBookSuccess("Libro actualizado correctamente.");
      } else {
        await adminService.createBook(payload);
        setBookSuccess("Libro creado correctamente.");
      }
      setBookForm({ title: "", author: "", isbn: "", publishYear: "", coverUrl: "", totalCopies: 1, categoryIds: [] });
      setEditingBookId(null);
      const booksData = await bookService.getAll();
      setBooks(booksData);
    } catch (err) {
      setBookError(err.response?.data?.message || "Error al guardar el libro.");
    }
  };

  const handleEditBook = (book) => {
    setEditingBookId(book.id);
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishYear: book.publishYear || "",
      coverUrl: book.coverUrl || "",
      totalCopies: book.totalCopies,
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
      } catch (err) {
        setBookError(err.response?.data?.message || "Error al eliminar el libro.");
      }
    });
  };

  // ── Multas ──────────────────────────────────────────────────────────────
  const handleDeleteFine = (id) => {
    confirm("¿Anular esta multa? Se eliminará la penalización del usuario.", async () => {
      setModal({ open: false });
      try {
        await adminService.deleteFine(id);
        setFines((prev) => prev.filter((f) => f.id !== id));
      } catch (err) {
        console.error("Error al anular la multa:", err);
      }
    });
  };

  // ── Categorías ──────────────────────────────────────────────────────────
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCategoryError(null);
    setCategorySuccess(null);
    try {
      if (editingCategoryId) {
        await adminService.updateCategory(editingCategoryId, categoryForm);
        setCategorySuccess("Categoría actualizada correctamente.");
      } else {
        await adminService.createCategory(categoryForm);
        setCategorySuccess("Categoría creada correctamente.");
      }
      setCategoryForm({ name: "", description: "" });
      setEditingCategoryId(null);
      const categoriesData = await bookService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      setCategoryError(err.response?.data?.message || "Error al guardar la categoría.");
    }
  };

  const handleDeleteCategory = (id) => {
    confirm("¿Eliminar esta categoría? Los libros asociados perderán esta categoría.", async () => {
      setModal({ open: false });
      try {
        await adminService.deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        setCategoryError(err.response?.data?.message || "Error al eliminar la categoría.");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel de administración</h1>

      <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Préstamos ── */}
      {activeTab === "Préstamos" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">{loans.length} préstamos en total</p>
          {loans.length === 0 && <p className="text-gray-400 text-center py-8">No hay préstamos.</p>}
          {loans.map((loan) => (
            <div key={loan.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">{loan.bookTitle}</p>
                <p className="text-sm text-gray-600 font-medium">{loan.userName}</p>
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
      )}

      {/* ── Multas ── */}
      {activeTab === "Multas" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">{fines.length} multas en total</p>
          {fines.length === 0 && <p className="text-gray-400 text-center py-8">No hay multas.</p>}
          {fines.map((fine) => (
            <div key={fine.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{fine.bookTitle}</p>
                <p className="text-sm text-gray-600 font-medium">{fine.userName}</p>
                <div className="flex gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                  <span>Días de retraso: <strong>{fine.daysOverdue}</strong></span>
                  <span>Penalización: <strong>{fine.penaltyDays} días</strong></span>
                  <span>Bloqueado hasta: <strong>{new Date(fine.penaltyUntil).toLocaleDateString("es-ES")}</strong></span>
                </div>
              </div>
              <button onClick={() => handleDeleteFine(fine.id)}
                className="text-sm border border-red-400 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
                Anular
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Reservas ── */}
      {activeTab === "Reservas" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">{reservations.length} reservas en total</p>
          {reservations.length === 0 && <p className="text-gray-400 text-center py-8">No hay reservas.</p>}
          {reservations.map((r) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">{r.bookTitle}</p>
                <p className="text-sm text-gray-600 font-medium">{r.userName} — posición {r.queuePosition}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Reservado: {new Date(r.reservationDate).toLocaleDateString("es-ES")}
                  {r.expiryDate && ` · Expira: ${new Date(r.expiryDate).toLocaleDateString("es-ES")}`}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium self-start sm:self-center ${statusReservationLabel[r.status]?.color}`}>
                {statusReservationLabel[r.status]?.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Libros ── */}
      {activeTab === "Libros" && (
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              {editingBookId ? "Editar libro" : "Añadir nuevo libro"}
            </h2>
            {bookSuccess && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">{bookSuccess}</div>}
            {bookError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{bookError}</div>}

            <form onSubmit={handleBookSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Título *" required value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Autor *" required value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="ISBN *" required value={bookForm.isbn}
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="Año de publicación" value={bookForm.publishYear}
                onChange={(e) => setBookForm({ ...bookForm, publishYear: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="URL portada" value={bookForm.coverUrl}
                onChange={(e) => setBookForm({ ...bookForm, coverUrl: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="Copias totales *" required min={1} value={bookForm.totalCopies}
                onChange={(e) => setBookForm({ ...bookForm, totalCopies: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

              <div className="sm:col-span-2">
                <p className="text-sm text-gray-600 mb-2">Categorías *</p>
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
                        }}
                        className="rounded" />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 flex gap-3">
                <button type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors">
                  {editingBookId ? "Actualizar" : "Crear libro"}
                </button>
                {editingBookId && (
                  <button type="button"
                    onClick={() => { setEditingBookId(null); setBookForm({ title: "", author: "", isbn: "", publishYear: "", coverUrl: "", totalCopies: 1, categoryIds: [] }); }}
                    className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-lg text-sm transition-colors">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {books.length === 0 && <p className="text-gray-400 text-center py-8">No hay libros.</p>}
            {books.map((book) => (
              <div key={book.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{book.title}</p>
                  <p className="text-sm text-gray-500">{book.author}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {book.categories?.map((cat) => (
                      <span key={cat} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{cat}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Copias: {book.availableCopies}/{book.totalCopies}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEditBook(book)}
                    className="text-sm border border-blue-400 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    Editar
                  </button>
                  <button onClick={() => handleDeleteBook(book.id)}
                    className="text-sm border border-red-400 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Categorías ── */}
      {activeTab === "Categorías" && (
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              {editingCategoryId ? "Editar categoría" : "Nueva categoría"}
            </h2>
            {categorySuccess && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">{categorySuccess}</div>}
            {categoryError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{categoryError}</div>}

            <form onSubmit={handleCategorySubmit} className="flex gap-3 flex-wrap">
              <input type="text" placeholder="Nombre *" required value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="flex-1 min-w-[150px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Descripción" value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="flex-1 min-w-[150px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors">
                {editingCategoryId ? "Actualizar" : "Crear"}
              </button>
              {editingCategoryId && (
                <button type="button"
                  onClick={() => { setEditingCategoryId(null); setCategoryForm({ name: "", description: "" }); }}
                  className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm transition-colors">
                  Cancelar
                </button>
              )}
            </form>
          </div>

          <div className="space-y-3">
            {categories.length === 0 && <p className="text-gray-400 text-center py-8">No hay categorías.</p>}
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{cat.name}</p>
                  {cat.description && <p className="text-sm text-gray-500">{cat.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingCategoryId(cat.id); setCategoryForm({ name: cat.name, description: cat.description || "" }); window.scrollTo(0, 0); }}
                    className="text-sm border border-blue-400 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    Editar
                  </button>
                  <button onClick={() => handleDeleteCategory(cat.id)}
                    className="text-sm border border-red-400 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal confirmación */}
      {modal.open && (
        <ConfirmModal
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal({ open: false })}
        />
      )}
    </div>
  );
};

export default AdminPage;