import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-5xl' };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${
        show ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div
        className={`bg-white border border-zinc-200 rounded-2xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] w-full ${widths[size]} transform transition-all duration-500 ease-out overflow-hidden ${
          show ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
          <h2 className="text-xl font-black text-zinc-800 tracking-tight uppercase tracking-widest text-xs opacity-80">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all active:scale-90"
          >
            <XMarkIcon className="w-6 h-6 stroke-2" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
