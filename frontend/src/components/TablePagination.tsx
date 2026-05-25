import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
}

export default function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems
}: TablePaginationProps) {
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between bg-white border-t border-gray-100 gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
          <span>Mostrar</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-transparent font-bold text-teal-600 focus:outline-none cursor-pointer"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>filas</span>
        </div>
        <p className="text-sm text-gray-600 font-medium">
          Mostrando <span className="font-bold text-gray-800">{start}-{end}</span> de <span className="font-bold text-gray-800">{totalItems}</span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl disabled:opacity-20 disabled:hover:bg-transparent transition-all"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-1">
          {pages.map((p, i) => (
            p === '...' ? (
              <span key={`dots-${i}`} className="px-2 text-gray-300">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(Number(p))}
                className={`min-w-[40px] h-10 rounded-xl text-sm font-bold transition-all ${
                  currentPage === p
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl disabled:opacity-20 disabled:hover:bg-transparent transition-all"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
