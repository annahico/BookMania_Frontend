import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import adminService from "../../api/adminService";
import bookService from "../../api/bookService";
import ConfirmModal from "../../components/common/ConfirmModal";
import Pagination from "../../components/common/Pagination";
import useToast from "../../hooks/useToast";

const TAB_KEYS = ["loans", "fines", "reservations", "books", "categories"];
const PAGE_SIZE = 15;

const AdminPage = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("loans");
  const [loans, setLoans] = useState([]);
  const [fines, setFines] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, message: "", onConfirm: null });
  const { showToast } = useToast();

  const statusLoanLabel = {
    ISSUED: { text: t("loans.statusIssued"), color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" },
    OVERDUE: { text: t("loans.statusOverdue"), color: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" },
    RETURNED: { text: t("loans.statusReturned"), color: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300" },
  };

  const statusReservationLabel = {
    PENDING: { text: t("reservations.statusPending"), color: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400" },
    FULFILLED: { text: t("reservations.statusFulfilled"), color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" },
    CANCELLED: { text: t("reservations.statusCancelled"), color: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300" },
    EXPIRED: { text: t("reservations.statusExpired"), color: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" },
  };

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

  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchAll must run only once on mount
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
    } catch {
      showToast(t("admin.loadError"), "error");
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

  const handleReturnLoan = (id) => {
    confirm(t("admin.loans.returnConfirm"), async () => {
      setModal({ open: false });
      try {
        const updated = await adminService.returnLoan(id);
        setLoans((prev) => prev.map((l) => (l.id === id ? updated : l)));
        showToast(t("admin.loans.returnSuccess"), "success");
      } catch (err) {
        showToast(err.response?.data?.message || t("admin.loans.returnError"), "error");
      }
    });
  };

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
        showToast(t("admin.books.updateSuccess"), "success");
      } else {
        await adminService.createBook(payload);
        showToast(t("admin.books.createSuccess"), "success");
      }
      setBookForm({ title: "", author: "", isbn: "", pages: "", publishYear: "", coverUrl: "", totalCopies: 1, categoryIds: [] });
      setEditingBookId(null);
      const booksData = await bookService.getAll({ size: 1000 });
      setBooks(booksData.content);
    } catch (err) {
      showToast(err.response?.data?.message || t("admin.books.saveError"), "error");
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
    setActiveTab("books");
    window.scrollTo(0, 0);
  };

  const handleDeleteBook = (id) => {
    confirm(t("admin.books.deleteConfirm"), async () => {
      setModal({ open: false });
      try {
        await adminService.deleteBook(id);
        setBooks((prev) => prev.filter((b) => b.id !== id));
        showToast(t("admin.books.deleteSuccess"), "success");
      } catch (err) {
        showToast(err.response?.data?.message || t("admin.books.deleteError"), "error");
      }
    });
  };

  const handleDeleteFine = (id) => {
    confirm(t("admin.fines.voidConfirm"), async () => {
      setModal({ open: false });
      try {
        await adminService.deleteFine(id);
        setFines((prev) => prev.filter((f) => f.id !== id));
        showToast(t("admin.fines.voidSuccess"), "success");
      } catch (err) {
        showToast(err.response?.data?.message || t("admin.fines.voidError"), "error");
      }
    });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await adminService.updateCategory(editingCategoryId, categoryForm);
        showToast(t("admin.categories.updateSuccess"), "success");
      } else {
        await adminService.createCategory(categoryForm);
        showToast(t("admin.categories.createSuccess"), "success");
      }
      setCategoryForm({ name: "", description: "" });
      setEditingCategoryId(null);
      setCategories(await bookService.getCategories());
    } catch (err) {
      showToast(err.response?.data?.message || t("admin.categories.saveError"), "error");
    }
  };

  const handleDeleteCategory = (id) => {
    confirm(t("admin.categories.deleteConfirm"), async () => {
      setModal({ open: false });
      try {
        await adminService.deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        showToast(t("admin.categories.deleteSuccess"), "success");
      } catch (err) {
        showToast(err.response?.data?.message || t("admin.categories.deleteError"), "error");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-pink-700 dark:text-pink-400">{t("admin.loading")}</p>
      </div>
    );
  }

  const inputClass = "border border-pink-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-600 w-full";
  const searchClass = "border border-pink-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-600 w-full max-w-2xl mb-4";
  const btnPrimary = "bg-pink-700 hover:bg-pink-800 dark:bg-pink-600 dark:hover:bg-pink-500 text-white font-medium px-6 py-2 rounded-xl text-sm transition-colors";
  const btnSecondary = "border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 px-6 py-2 rounded-xl text-sm transition-colors";
  const btnEdit = "text-sm border border-pink-400 dark:border-pink-800 text-pink-700 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors";
  const btnDelete = "text-sm border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-1.5 rounded-xl transition-colors";

  return (
    <div>
      <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-400 mb-6">{t("admin.title")}</h1>

      <div role="tablist" aria-label={t("admin.title")} className="flex gap-2 mb-8 border-b border-pink-100 dark:border-slate-700 overflow-x-auto">
        {TAB_KEYS.map((tab) => (
          <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 ${activeTab === tab
              ? "border-pink-700 dark:border-pink-400 text-pink-700 dark:text-pink-400"
              : "border-transparent text-gray-600 dark:text-slate-400 hover:text-pink-700 dark:hover:text-pink-400"}`}>
            {t(`admin.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* ── Préstamos ── */}
      {activeTab === "loans" && (
        <div>
          <label htmlFor="admin-loan-search" className="sr-only">{t("admin.loans.searchLabel")}</label>
          <input id="admin-loan-search" type="text" placeholder={t("admin.loans.searchPlaceholder")} value={loanSearch}
            onChange={(e) => { setLoanSearch(e.target.value); setLoanPage(0); }}
            className={searchClass} />
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            {t("admin.loans.count", { count: filteredLoans.length })}
            {totalPages(filteredLoans) > 1 && ` · ${t("loans.pageOf", { current: loanPage + 1, total: totalPages(filteredLoans) })}`}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredLoans.length === 0 && <p className="text-gray-600 dark:text-slate-300 text-center py-8 lg:col-span-2">{t("admin.loans.noResults")}</p>}
            {paginate(filteredLoans, loanPage).map((loan) => (
              <div key={loan.id} className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-pink-700 dark:text-pink-400">{loan.bookTitle}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300">{loan.userName}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-600 dark:text-slate-300 flex-wrap">
                    <span>{t("admin.loans.due", { date: new Date(loan.dueDate).toLocaleDateString(i18n.language) })}</span>
                    {loan.returnDate && <span>{t("admin.loans.returned", { date: new Date(loan.returnDate).toLocaleDateString(i18n.language) })}</span>}
                    <span>{t("admin.loans.extensions", { count: loan.extensionsUsed })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLoanLabel[loan.status]?.color}`}>
                    {statusLoanLabel[loan.status]?.text}
                  </span>
                  {loan.status !== "RETURNED" && (
                    <button onClick={() => handleReturnLoan(loan.id)} className={btnEdit}>{t("admin.loans.markReturned")}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={loanPage} totalPages={totalPages(filteredLoans)} onPageChange={setLoanPage} />
        </div>
      )}

      {activeTab === "fines" && (
        <div>
          <label htmlFor="admin-fine-search" className="sr-only">{t("admin.fines.searchLabel")}</label>
          <input id="admin-fine-search" type="text" placeholder={t("admin.fines.searchPlaceholder")} value={fineSearch}
            onChange={(e) => { setFineSearch(e.target.value); setFinePage(0); }}
            className={searchClass} />
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            {t("admin.fines.count", { count: filteredFines.length })}
            {totalPages(filteredFines) > 1 && ` · ${t("loans.pageOf", { current: finePage + 1, total: totalPages(filteredFines) })}`}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredFines.length === 0 && <p className="text-gray-600 dark:text-slate-300 text-center py-8 lg:col-span-2">{t("admin.fines.noResults")}</p>}
            {paginate(filteredFines, finePage).map((fine) => (
              <div key={fine.id} className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-pink-700 dark:text-pink-400">{fine.bookTitle}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300">{fine.userName}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-600 dark:text-slate-300 flex-wrap">
                    <span>{t("admin.fines.overdueLabel", { count: fine.daysOverdue })}</span>
                    <span>{t("admin.fines.penaltyLabel", { count: fine.penaltyDays })}</span>
                    <span>{t("admin.fines.untilLabel", { date: new Date(fine.penaltyUntil).toLocaleDateString(i18n.language) })}</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteFine(fine.id)} className={btnDelete}>{t("admin.fines.void")}</button>
              </div>
            ))}
          </div>
          <Pagination currentPage={finePage} totalPages={totalPages(filteredFines)} onPageChange={setFinePage} />
        </div>
      )}

      {activeTab === "reservations" && (
        <div>
          <label htmlFor="admin-reservation-search" className="sr-only">{t("admin.reservations.searchLabel")}</label>
          <input id="admin-reservation-search" type="text" placeholder={t("admin.reservations.searchPlaceholder")} value={reservationSearch}
            onChange={(e) => { setReservationSearch(e.target.value); setReservationPage(0); }}
            className={searchClass} />
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            {t("admin.reservations.count", { count: filteredReservations.length })}
            {totalPages(filteredReservations) > 1 && ` · ${t("loans.pageOf", { current: reservationPage + 1, total: totalPages(filteredReservations) })}`}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredReservations.length === 0 && <p className="text-gray-600 dark:text-slate-300 text-center py-8 lg:col-span-2">{t("admin.reservations.noResults")}</p>}
            {paginate(filteredReservations, reservationPage).map((r) => (
              <div key={r.id} className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-pink-700 dark:text-pink-400">{r.bookTitle}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300">{t("admin.reservations.position", { name: r.userName, position: r.queuePosition })}</p>
                  <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                    {new Date(r.reservationDate).toLocaleDateString(i18n.language)}
                    {r.expiryDate && ` · ${t("admin.reservations.expires", { date: new Date(r.expiryDate).toLocaleDateString(i18n.language) })}`}
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

      {activeTab === "books" && (
        <div>
          <div className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-pink-700 dark:text-pink-400 mb-4">
              {editingBookId ? t("admin.books.editTitle") : t("admin.books.newTitle")}
            </h2>
            <form onSubmit={handleBookSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input className={inputClass} type="text" placeholder={t("admin.books.titlePlaceholder")} aria-label={t("admin.books.titleLabel")} required
                value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} />
              <input className={inputClass} type="text" placeholder={t("admin.books.authorPlaceholder")} aria-label={t("admin.books.authorLabel")} required
                value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} />
              <input className={inputClass} type="text" placeholder={t("admin.books.isbnPlaceholder")} aria-label={t("admin.books.isbnLabel")} required
                value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} />
              <input className={inputClass} type="number" placeholder={t("admin.books.pagesPlaceholder")} aria-label={t("admin.books.pagesLabel")} min={1}
                value={bookForm.pages} onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })} />
              <input className={inputClass} type="number" placeholder={t("admin.books.publishYearPlaceholder")} aria-label={t("admin.books.publishYearLabel")}
                value={bookForm.publishYear} onChange={(e) => setBookForm({ ...bookForm, publishYear: e.target.value })} />
              <input className={inputClass} type="text" placeholder={t("admin.books.coverUrlPlaceholder")} aria-label={t("admin.books.coverUrlLabel")}
                value={bookForm.coverUrl} onChange={(e) => setBookForm({ ...bookForm, coverUrl: e.target.value })} />
              <input className={inputClass} type="number" placeholder={t("admin.books.totalCopiesPlaceholder")} aria-label={t("admin.books.totalCopiesLabel")} required min={1}
                value={bookForm.totalCopies} onChange={(e) => setBookForm({ ...bookForm, totalCopies: e.target.value })} />
              <div className="sm:col-span-2">
                <p className="text-sm text-pink-700 dark:text-pink-400 font-medium mb-2">{t("admin.books.categoriesLabel")}</p>
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
                        }} className="rounded accent-pink-600" />
                      <span className="text-sm text-gray-700 dark:text-slate-300">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" className={btnPrimary}>
                  {editingBookId ? t("admin.books.update") : t("admin.books.create")}
                </button>
                {editingBookId && (
                  <button type="button" className={btnSecondary}
                    onClick={() => { setEditingBookId(null); setBookForm({ title: "", author: "", isbn: "", pages: "", publishYear: "", coverUrl: "", totalCopies: 1, categoryIds: [] }); }}>
                    {t("admin.books.cancelEdit")}
                  </button>
                )}
              </div>
            </form>
          </div>

          <label htmlFor="admin-book-search" className="sr-only">{t("admin.books.searchLabel")}</label>
          <input id="admin-book-search" type="text" placeholder={t("admin.books.searchPlaceholder")} value={bookSearch}
            onChange={(e) => { setBookSearch(e.target.value); setBookPage(0); }}
            className={searchClass} />
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            {t("admin.books.count", { count: filteredBooks.length })}
            {totalPages(filteredBooks) > 1 && ` · ${t("loans.pageOf", { current: bookPage + 1, total: totalPages(filteredBooks) })}`}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredBooks.length === 0 && <p className="text-gray-600 dark:text-slate-300 text-center py-8 lg:col-span-2">{t("admin.books.noResults")}</p>}
            {paginate(filteredBooks, bookPage).map((book) => (
              <div key={book.id} className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-pink-700 dark:text-pink-400">{book.title}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{book.author}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {book.categories?.map((cat) => (
                      <span key={cat} className="text-xs bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-100 dark:border-pink-900 px-2 py-0.5 rounded-full">{cat}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">{t("admin.books.copies", { available: book.availableCopies, total: book.totalCopies })}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEditBook(book)} className={btnEdit}>{t("admin.books.edit")}</button>
                  <button onClick={() => handleDeleteBook(book.id)} className={btnDelete}>{t("admin.books.delete")}</button>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={bookPage} totalPages={totalPages(filteredBooks)} onPageChange={setBookPage} />
        </div>
      )}

      {activeTab === "categories" && (
        <div>
          <div className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-pink-700 dark:text-pink-400 mb-4">
              {editingCategoryId ? t("admin.categories.editTitle") : t("admin.categories.newTitle")}
            </h2>
            <form onSubmit={handleCategorySubmit} className="flex gap-3 flex-wrap">
              <input type="text" placeholder={t("admin.categories.namePlaceholder")} aria-label={t("admin.categories.nameLabel")} required value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="flex-1 min-w-[150px] border border-pink-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-600" />
              <input type="text" placeholder={t("admin.categories.descriptionPlaceholder")} aria-label={t("admin.categories.descriptionLabel")} value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="flex-1 min-w-[150px] border border-pink-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-600" />
              <button type="submit" className={btnPrimary}>
                {editingCategoryId ? t("admin.categories.update") : t("admin.categories.create")}
              </button>
              {editingCategoryId && (
                <button type="button" className={btnSecondary}
                  onClick={() => { setEditingCategoryId(null); setCategoryForm({ name: "", description: "" }); }}>
                  {t("admin.categories.cancelEdit")}
                </button>
              )}
            </form>
          </div>

          <label htmlFor="admin-category-search" className="sr-only">{t("admin.categories.searchLabel")}</label>
          <input id="admin-category-search" type="text" placeholder={t("admin.categories.searchPlaceholder")} value={categorySearch}
            onChange={(e) => { setCategorySearch(e.target.value); setCategoryPage(0); }}
            className={searchClass} />
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            {t("admin.categories.count", { count: filteredCategories.length })}
            {totalPages(filteredCategories) > 1 && ` · ${t("loans.pageOf", { current: categoryPage + 1, total: totalPages(filteredCategories) })}`}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredCategories.length === 0 && <p className="text-gray-600 dark:text-slate-300 text-center py-8 lg:col-span-2">{t("admin.categories.noResults")}</p>}
            {paginate(filteredCategories, categoryPage).map((cat) => (
              <div key={cat.id} className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-pink-700 dark:text-pink-400">{cat.name}</p>
                  {cat.description && <p className="text-sm text-gray-600 dark:text-slate-400">{cat.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingCategoryId(cat.id); setCategoryForm({ name: cat.name, description: cat.description || "" }); window.scrollTo(0, 0); }}
                    className={btnEdit}>{t("admin.categories.edit")}</button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className={btnDelete}>{t("admin.categories.delete")}</button>
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
