import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";

const CustomDataTable = ({
  columns,
  data,
  totalRows,
  rowsPerPageOptions = [10, 20, 50, 100, 500, 1000],
  defaultRowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  currentPage,
}) => {
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  useEffect(() => {
    onPageChange(currentPage || 1);
  }, [currentPage, onPageChange]);

  const handlePageClick = (page) => onPageChange(page);

  const handleRowsPerPageChange = (e) => {
    const newRows = parseInt(e.target.value, 10);
    setRowsPerPage(newRows);
    onRowsPerPageChange(newRows);
    onPageChange(1);
  };

  const startItem = Math.max((currentPage - 1) * rowsPerPage + 1, 1);
  const endItem = Math.min(currentPage * rowsPerPage, totalRows);

  const renderPaginationButtons = () => {
    const btns = [];
    const start = Math.max(currentPage - 2, 1);
    const end = Math.min(currentPage + 2, totalPages);
    const baseBtn =
      "w-10 h-10 text-sm font-semibold text-gray-700 rounded-full border border-gray-200 bg-white hover:bg-gray-50";
    const activeBtn =
      "bg-blue-600 text-white border-blue-600 shadow ring-2 ring-blue-200 hover:bg-blue-600";

    if (start > 1) {
      btns.push(
        <button
          key={1}
          onClick={() => handlePageClick(1)}
          className={baseBtn}
        >
          1
        </button>
      );
      if (start > 2) btns.push(<span key="dots1">…</span>);
    }

    for (let i = start; i <= end; i++) {
      btns.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`${baseBtn} ${i === currentPage ? activeBtn : ""}`}
          style={
            i === currentPage
              ? {
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  borderColor: "#2563eb",
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)",
                }
              : { backgroundColor: "#ffffff", color: "#374151" }
          }
        >
          {i}
        </button>
      );
    }

    if (end < totalPages - 1) btns.push(<span key="dots2">…</span>);

    if (end < totalPages) {
      btns.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          className={baseBtn}
        >
          {totalPages}
        </button>
      );
    }

    return btns;
  };

  return (
    <div className="w-full" style={{ margin: 0 }}>
      {/* =========================
          DESKTOP / TABLE VIEW
      ========================== */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[900px] w-full bg-white border rounded shadow">
          <thead className="sticky top-0  bg-gray-200">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-3 py-2 text-left text-sm font-semibold text-gray-700 whitespace-nowrap"
                  style={{ width: col.width || "auto" }}
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b hover:bg-gray-50 transition"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap"
                  >
                    {col.selector
                      ? col.selector(row)
                      : row[col.selectorKey]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================
          MOBILE / CARD VIEW
          (320px optimized)
      ========================== */}
      <div className="md:hidden grid grid-cols-1 gap-3 mt-3">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="bg-white border rounded-lg shadow p-3 space-y-2"
          >
            {columns.map((col, colIndex) => (
              <div
                key={colIndex}
                className="flex justify-between gap-3 text-sm"
              >
                <span className="text-gray-500 font-medium">
                  {col.name}
                </span>
                <span className="text-gray-800 text-right break-all">
                  {col.selector
                    ? col.selector(row)
                    : row[col.selectorKey]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* =========================
          PAGINATION (ALL SCREENS)
      ========================== */}
      <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Rows per page */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-600">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border rounded px-2 py-1 text-sm"
          >
            {rowsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="text-gray-600">
            {startItem}-{endItem} of {totalRows}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 justify-center w-full overflow-x-auto lg:overflow-visible">
          <button
            onClick={() =>
              handlePageClick(Math.max(currentPage - 1, 1))
            }
            disabled={currentPage === 1}
            className="w-12 h-12 text-2xl rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            ‹
          </button>

          <div className="flex flex-nowrap gap-2">
            {renderPaginationButtons()}
          </div>

          <button
            onClick={() =>
              handlePageClick(
                Math.min(currentPage + 1, totalPages)
              )
            }
            disabled={currentPage === totalPages}
            className="w-12 h-12 text-2xl rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDataTable;
