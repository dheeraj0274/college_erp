import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, ChevronsLeft, ChevronsRight } from 'lucide-react';
import clsx from 'clsx';

export default function Table({
  columns,
  data,
  searchable = false,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon,
  onRowClick,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  // Filter
  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? row[col.accessor] : '';
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-900 rounded-xl border border-surface-200 dark:border-dark-700 overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              {Array.from({ length: columns.length }).map((_, j) => (
                <div key={j} className="h-4 bg-surface-200 dark:bg-dark-700 rounded animate-pulse flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-900 rounded-xl border border-surface-200 dark:border-dark-700 overflow-hidden">
      {/* Search */}
      {searchable && (
        <div className="px-4 py-3 border-b border-surface-200 dark:border-dark-700">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-surface-50 dark:bg-dark-800 border border-surface-200 dark:border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 dark:border-dark-700 bg-surface-50 dark:bg-dark-800/50">
              {columns.map((col) => (
                <th
                  key={col.accessor || col.header}
                  onClick={() => col.sortable !== false && handleSort(col.accessor)}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400',
                    col.sortable !== false && col.accessor && 'cursor-pointer select-none hover:text-surface-700 dark:hover:text-surface-200',
                    col.className
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sortKey === col.accessor && (
                      sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-dark-700/50">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {EmptyIcon && <EmptyIcon className="h-8 w-8 text-surface-300 dark:text-dark-700" />}
                    <p className="text-sm text-surface-500 dark:text-surface-400">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={row._id || row.id || i}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    'transition-colors duration-100',
                    'hover:bg-surface-50 dark:hover:bg-dark-800/50',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.accessor || col.header}
                      className={clsx(
                        'px-4 py-3 text-sm text-surface-700 dark:text-surface-300',
                        col.cellClassName
                      )}
                    >
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-dark-700">
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="p-1 rounded text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-dark-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="p-1 rounded text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-dark-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs text-surface-600 dark:text-surface-400 font-medium">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="p-1 rounded text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-dark-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="p-1 rounded text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-dark-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
