"use client";

import { ReactNode } from "react";
import { X, AlertTriangle, Trash2, CheckCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
  isLoading?: boolean;
  children?: ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = "warning",
  isLoading = false,
  children,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const styles = {
    danger: {
      icon: <Trash2 className="h-6 w-6 text-red-600" />,
      iconBg: "bg-red-100",
      confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
      iconBg: "bg-yellow-100",
      confirmBtn: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    },
    info: {
      icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
      iconBg: "bg-blue-100",
      confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    },
    success: {
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      iconBg: "bg-green-100",
      confirmBtn: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    },
  };

  const style = styles[type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-6">
            {/* Icon */}
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${style.iconBg} mb-4`}
            >
              {style.icon}
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-600 text-sm">{message}</p>
              {children && <div className="mt-4">{children}</div>}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md text-white font-medium transition-colors disabled:opacity-50 ${style.confirmBtn}`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Traitement...
                  </span>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for easy modal state management
import { useState, useCallback } from "react";

export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<ConfirmModalProps>>({});
  const [resolveRef, setResolveRef] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback(
    (modalConfig: Omit<ConfirmModalProps, "isOpen" | "onClose" | "onConfirm">) => {
      return new Promise<boolean>((resolve) => {
        setConfig(modalConfig);
        setResolveRef({ resolve });
        setIsOpen(true);
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    resolveRef?.resolve(true);
    setIsOpen(false);
    setResolveRef(null);
  }, [resolveRef]);

  const handleClose = useCallback(() => {
    resolveRef?.resolve(false);
    setIsOpen(false);
    setResolveRef(null);
  }, [resolveRef]);

  const modalProps: ConfirmModalProps = {
    isOpen,
    onClose: handleClose,
    onConfirm: handleConfirm,
    title: config.title || "Confirmation",
    message: config.message || "Êtes-vous sûr ?",
    confirmText: config.confirmText,
    cancelText: config.cancelText,
    type: config.type || "warning",
    isLoading: config.isLoading,
    children: config.children,
  };

  return { confirm, modalProps };
}
