import { useState } from "react";
import { useTranslation } from "react-i18next";
import adminService from "../../../api/adminService";
import bookService from "../../../api/bookService";
import Pagination from "../../../components/common/Pagination";
import useToast from "../../../hooks/useToast";
import { paginate, totalPages, searchClass, inputClass, btnPrimary, btnSecondary, btnEdit, btnDelete } from "../adminShared";

const EMPTY_BOOK_FORM = { title: "", author: "", isbn: "", publishYear: "", pages: "", coverUrl: "", totalCopies: 1, categoryIds: [] };

const AdminBooksTab = ({ books, setBooks, categories, confirm }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [bookForm, setBookForm] = useState(EMPTY_BOOK_FORM);
  const [editingBookId, setEditingBookId] = useState(null);

  const filtered = books.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
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
      setBookForm(EMPTY_BOOK_FORM);
      setEditingBookId(null);
      const booksData = await bookService.getAll({ size: 1000 });
      setBooks(booksData.content);
    } catch (err) {
      showToast(err.response?.data?.message || t("admin.books.saveError"), "error");
    }
  };

  const handleEdit = (book) => {
    setEditingBookId(book.id);
    setBookForm({
      title: book.title, author: book.author, isbn: book.isbn,
      publishYear: book.publishYear || "", coverUrl: book.coverUrl || "",
      totalCopies: book.totalCopies, pages: book.pages || "",
      categoryIds: categories.filter((c) => book.categories?.includes(c.name)).map((c) => c.id),
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = (id) => {
    confirm(t("admin.books.deleteConfirm"), async () => {
      try {
        await adminService.deleteBook(id);
        setBooks((prev) => prev.filter((b) => b.id !== id));
        showToast(t("admin.books.deleteSuccess"), "success");
      } catch (err) {
        showToast(err.response?.data?.message || t("admin.books.deleteError"), "error");
      }
    });
  };

  return (
    <div>
      <div className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-pink-700 dark:text-pink-400 mb-4">
          {editingBookId ? t("admin.books.editTitle") : t("admin.books.newTitle")}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                onClick={() => { setEditingBookId(null); setBookForm(EMPTY_BOOK_FORM); }}>
                {t("admin.books.cancelEdit")}
              </button>
            )}
          </div>
        </form>
      </div>

      <label htmlFor="admin-book-search" className="sr-only">{t("admin.books.searchLabel")}</label>
      <input id="admin-book-search" type="text" placeholder={t("admin.books.searchPlaceholder")} value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        className={searchClass} />
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
        {t("admin.books.count", { count: filtered.length })}
        {totalPages(filtered) > 1 && ` · ${t("loans.pageOf", { current: page + 1, total: totalPages(filtered) })}`}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.length === 0 && <p className="text-gray-600 dark:text-slate-300 text-center py-8 lg:col-span-2">{t("admin.books.noResults")}</p>}
        {paginate(filtered, page).map((book) => (
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
              <button onClick={() => handleEdit(book)} className={btnEdit}>{t("admin.books.edit")}</button>
              <button onClick={() => handleDelete(book.id)} className={btnDelete}>{t("admin.books.delete")}</button>
            </div>
          </div>
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages(filtered)} onPageChange={setPage} />
    </div>
  );
};

export default AdminBooksTab;
