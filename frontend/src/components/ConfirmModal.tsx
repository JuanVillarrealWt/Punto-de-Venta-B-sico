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
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200',
    info: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200',
  };

  const iconColors = {
    danger: 'text-red-500 bg-red-50',
    warning: 'text-amber-500 bg-amber-50',
    info: 'text-teal-500 bg-teal-50',
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        show ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-transparent'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all duration-300 ${
          show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-end mb-2">
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-2xl mb-4 ${iconColors[type]}`}>
              <ExclamationTriangleIcon className="w-10 h-10" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              {message}
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-500 font-semibold hover:text-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${colors[type]}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
