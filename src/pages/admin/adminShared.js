// Shared constants and Tailwind class strings reused by every admin tab, so
// each tab file doesn't have to redefine (and risk drifting) the same
// pagination size or button/input styling.

export const PAGE_SIZE = 15;

export const paginate = (items, page) => items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
export const totalPages = (items) => Math.ceil(items.length / PAGE_SIZE);

export const inputClass = "border border-pink-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-600 w-full";
export const searchClass = "border border-pink-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-600 w-full max-w-2xl mb-4";
export const btnPrimary = "bg-pink-700 hover:bg-pink-800 dark:bg-pink-600 dark:hover:bg-pink-500 text-white font-medium px-6 py-2 rounded-xl text-sm transition-colors";
export const btnSecondary = "border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 px-6 py-2 rounded-xl text-sm transition-colors";
export const btnEdit = "text-sm border border-pink-400 dark:border-pink-800 text-pink-700 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors";
export const btnDelete = "text-sm border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-1.5 rounded-xl transition-colors";
