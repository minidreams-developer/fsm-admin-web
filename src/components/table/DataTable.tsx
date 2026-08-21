import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey?: (row: T, index: number) => string | number;

  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onSelectRow?: (row: T) => void;
  onSelectAll?: () => void;

  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  selectable = false,
  selectedIds = new Set(),
  onSelectRow,
  onSelectAll,
  onRowClick,
  emptyMessage = "No data found.",
}: DataTableProps<T>) {
  const getId = (row: T, index: number) =>
    getRowKey?.(row, index) ?? index;

  const allSelected =
    data.length > 0 &&
    data.every((row, index) => selectedIds.has(getId(row, index)));

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-border">
            {selectable && (
              <th className="px-3 py-2.5 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
              </th>
            )}

            {columns.map((column) => (
              <th
                key={column.key}
                className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-3 py-8 text-center text-xs text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const id = getId(row, index);

              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-border last:border-0 ${
                    onRowClick
                      ? "hover:bg-secondary/30 transition-colors cursor-pointer"
                      : ""
                  }`}
                >
                  {selectable && (
                    <td
                      className="px-3 py-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(id)}
                        onChange={() => onSelectRow?.(row)}
                        className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                      />
                    </td>
                  )}

                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-3 py-2.5 text-xs text-card-foreground"
                    >
                      {column.render
                        ? column.render(row)
                        : String(
                            row[column.key as keyof T] ?? "—"
                          )}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}