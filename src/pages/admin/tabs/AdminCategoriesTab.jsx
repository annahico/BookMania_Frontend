import { useState } from "react";
import { useTranslation } from "react-i18next";
import adminService from "../../../api/adminService";
import bookService from "../../../api/bookService";
import Pagination from "../../../components/common/Pagination";
import useToast from "../../../hooks/useToast";
import { paginate, totalPages, searchClass, btnPrimary, btnSecondary, btnEdit, btnDelete } from "../adminShared";

const EMPTY_CATEGORY_FORM = { name: "", description: "" };

const AdminCategoriesTab = ({ categories, setCategories, confirm }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const filtered = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await adminService.updateCategory(editingCategoryId, categoryForm);
        showToast(t("admin.categories.updateSuccess"), "success");
      } else {
        await adminService.createCategory(categoryForm);
        showToast(t("admin.categories.createSuccess"), "success");
      }
      setCategoryForm(EMPTY_CATEGORY_FORM);
      setEditingCategoryId(null);
      setCategories(await bookService.getCategories());
    } catch (err) {
      showToast(err.response?.data?.message || t("admin.categories.saveError"), "error");
    }
  };

  const handleDelete = (id) => {
    confirm(t("admin.categories.deleteConfirm"), async () => {
      try {
        await adminService.deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        showToast(t("admin.categories.deleteSuccess"), "success");
      } catch (err) {
        showToast(err.response?.data?.message || t("admin.categories.deleteError"), "error");
      }
    });
  };

  return (
    <div>
      <div className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-pink-700 dark:text-pink-400 mb-4">
          {editingCategoryId ? t("admin.categories.editTitle") : t("admin.categories.newTitle")}
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap">
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
              onClick={() => { setEditingCategoryId(null); setCategoryForm(EMPTY_CATEGORY_FORM); }}>
              {t("admin.categories.cancelEdit")}
            </button>
          )}
        </form>
      </div>

      <label htmlFor="admin-category-search" className="sr-only">{t("admin.categories.searchLabel")}</label>
      <input id="admin-category-search" type="text" placeholder={t("admin.categories.searchPlaceholder")} value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        className={searchClass} />
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
        {t("admin.categories.count", { count: filtered.length })}
        {totalPages(filtered) > 1 && ` · ${t("loans.pageOf", { current: page + 1, total: totalPages(filtered) })}`}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.length === 0 && <p className="text-gray-600 dark:text-slate-300 text-center py-8 lg:col-span-2">{t("admin.categories.noResults")}</p>}
        {paginate(filtered, page).map((cat) => (
          <div key={cat.id} className="bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-pink-700 dark:text-pink-400">{cat.name}</p>
              {cat.description && <p className="text-sm text-gray-600 dark:text-slate-400">{cat.description}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingCategoryId(cat.id); setCategoryForm({ name: cat.name, description: cat.description || "" }); window.scrollTo(0, 0); }}
                className={btnEdit}>{t("admin.categories.edit")}</button>
              <button onClick={() => handleDelete(cat.id)} className={btnDelete}>{t("admin.categories.delete")}</button>
            </div>
          </div>
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages(filtered)} onPageChange={setPage} />
    </div>
  );
};

export default AdminCategoriesTab;
