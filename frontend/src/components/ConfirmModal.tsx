import { useEffect, useState } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  type = 'danger'
}: ConfirmModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const colors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
    info: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
  };

  const iconColors = {
    danger: 'text-red-600 bg-red-50 border-red-100',
    warning: 'text-amber-600 bg-amber-50 border-amber-100',
    info: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 ${
        show ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all duration-500 ${
          show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-end mb-2">
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-xl transition-all text-zinc-400 hover:text-zinc-700 active:scale-90">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className={`p-5 rounded-2xl mb-6 border-2 ${iconColors[type]}`}>
              <ExclamationTriangleIcon className="w-12 h-12" />
            </div>
            
            <h3 className="text-2xl font-black text-zinc-800 mb-3 tracking-tighter">{title}</h3>
            <p className="text-zinc-500 text-sm font-bold leading-relaxed mb-10 px-2">
              {message}
            </p>

            <div className="flex flex-col gap-3 w-full">
               <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${colors[type]}`}
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 text-zinc-400 font-black text-xs uppercase tracking-widest hover:text-zinc-600 hover:bg-zinc-50 rounded-xl transition-colors"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
