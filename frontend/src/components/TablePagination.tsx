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
    <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between bg-white border-t border-zinc-200 gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex items-center gap-3 text-xs font-black text-zinc-500 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-200 uppercase tracking-widest">
          <span>Ver</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-transparent font-black text-zinc-800 focus:outline-none cursor-pointer appearance-none px-1"
          >
            {[10, 15, 20, 30].map((size) => (
              <option key={size} value={size} className="bg-white">{size}</option>
            ))}
          </select>
          <span className="opacity-40">registros</span>
        </div>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
          Mostrando <span className="text-zinc-800">{start}-{end}</span> de <span className="text-zinc-800">{totalItems}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-3 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl disabled:opacity-10 disabled:hover:bg-transparent transition-all active:scale-90"
        >
          <ChevronLeftIcon className="w-5 h-5 stroke-2" />
        </button>
        
        <div className="flex items-center gap-1.5">
          {pages.map((p, i) => (
            p === '...' ? (
              <span key={`dots-${i}`} className="px-2 text-zinc-400 font-black">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(Number(p))}
                className={`min-w-[40px] h-10 rounded-xl text-xs font-black transition-all ${
                  currentPage === p
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'
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
          className="p-3 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl disabled:opacity-10 disabled:hover:bg-transparent transition-all active:scale-90"
        >
          <ChevronRightIcon className="w-5 h-5 stroke-2" />
        </button>
      </div>
    </div>
  );
}
