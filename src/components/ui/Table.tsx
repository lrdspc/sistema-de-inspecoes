import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Column<T> {
  key: keyof T;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortColumn?: keyof T;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: keyof T) => void;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectRow?: (row: T) => void;
  onSelectAll?: (selected: boolean) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  emptyState?: React.ReactNode;
  className?: string;
}

export function Table<T>({
  data,
  columns,
  sortColumn,
  sortDirection,
  onSort,
  selectable,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  pagination,
  emptyState,
  className,
}: TableProps<T>) {
  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    if (sortColumn !== column.key)
      return <ChevronsUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const isRowSelected = (row: T) =>
    selectedRows.some((selectedRow) => selectedRow === row);

  const allRowsSelected =
    data.length > 0 && selectedRows.length === data.length;

  const handleSelectAll = () => {
    onSelectAll?.(!allRowsSelected);
  };

  const renderPagination = () => {
    if (!pagination) return null;
    const { currentPage, totalPages, onPageChange } = pagination;

    return (
      <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Página <span className="font-medium">{currentPage}</span> de{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={cn(
                      'relative inline-flex items-center border px-4 py-2 text-sm font-medium',
                      page === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex h-64 items-center justify-center">
          {emptyState || (
            <p className="text-center text-gray-500">Nenhum dado encontrado</p>
          )}
        </div>
        {renderPagination()}
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-lg border border-gray-200 bg-white', className)}
    >
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th scope="col" className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={allRowsSelected}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  style={{ width: column.width }}
                  className={cn(
                    'px-6 py-3 text-left text-sm font-semibold text-gray-900',
                    column.sortable && 'cursor-pointer'
                  )}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'hover:bg-gray-50',
                  isRowSelected(row) && 'bg-blue-50'
                )}
              >
                {selectable && (
                  <td className="whitespace-nowrap px-6 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={isRowSelected(row)}
                      onChange={() => onSelectRow?.(row)}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="whitespace-nowrap px-6 py-4 text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderPagination()}
    </div>
  );
}

// Example usage:
/*
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns: Column<User>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email' },
  {
    key: 'role',
    header: 'Role',
    render: (value) => (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
        {value}
      </span>
    ),
  },
];

<Table
  data={users}
  columns={columns}
  sortColumn="name"
  sortDirection="asc"
  onSort={(column) => console.log('Sort by', column)}
  selectable
  selectedRows={selectedUsers}
  onSelectRow={(user) => handleSelectUser(user)}
  onSelectAll={(selected) => handleSelectAll(selected)}
  pagination={{
    currentPage: 1,
    totalPages: 5,
    onPageChange: (page) => handlePageChange(page),
  }}
/>
*/
