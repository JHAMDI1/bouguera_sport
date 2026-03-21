"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isLoading: boolean;
  loadingText: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function SubmitButton({
  isLoading,
  loadingText,
  children,
  className = "",
  onClick,
  type = "submit",
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4 mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitText?: string;
  loadingText?: string;
}

export function FormActions({
  onCancel,
  isSubmitting,
  submitText = "Enregistrer",
  loadingText = "Enregistrement...",
}: FormActionsProps) {
  return (
    <div className="mt-6 flex justify-end space-x-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Annuler
      </button>
      <SubmitButton
        isLoading={isSubmitting}
        loadingText={loadingText}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {submitText}
      </SubmitButton>
    </div>
  );
}
