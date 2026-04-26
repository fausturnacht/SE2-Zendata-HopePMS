import React, { useState } from 'react';
import { softDeleteProduct } from '../../api/products';

export interface SoftDeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prodCode: string;
  onConfirmed?: () => void;
}

export const SoftDeleteConfirmDialog: React.FC<SoftDeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  prodCode,
  onConfirmed,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await softDeleteProduct(prodCode);
      // Notify parent that delete was successful
      if (onConfirmed) {
        onConfirmed();
      }
      onClose();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: 'rgba(42, 52, 57, 0.3)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={handleBackdropClick}
    >
      {/* Modal Dialog */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_0_40px_rgba(42,52,57,0.12)] w-full max-w-[400px] flex flex-col relative overflow-hidden">
        {/* Content Container */}
        <div className="p-8 flex flex-col items-center text-center">
          {/* Warning Icon Container */}
          <div className="w-14 h-14 rounded-full bg-error-container/30 flex items-center justify-center mb-6">
            <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center">
              <span
                className="material-symbols-outlined text-error text-2xl"
                data-icon="warning"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
            </div>
          </div>

          {/* Text Content */}
          <h2 className="font-headline text-xl font-bold text-on-surface tracking-tight mb-3">
            Delete Product?
          </h2>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-8 max-w-[280px]">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-on-surface">{prodCode}</span>? This can be
            recovered later from Deleted Items.
          </p>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-error/10 border border-error rounded-lg mb-6 w-full">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex w-full gap-3 sm:gap-4 flex-col sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-surface-container-low text-on-surface hover:bg-surface-variant transition-colors duration-200 rounded-lg py-2.5 px-4 font-body text-sm font-medium text-center ring-1 ring-inset ring-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-error text-on-error hover:bg-error-dim transition-colors duration-200 rounded-lg py-2.5 px-4 font-body text-sm font-semibold tracking-wide text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-error/50 focus:ring-offset-2 focus:ring-offset-surface-container-lowest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && (
                <svg
                  className="w-4 h-4 animate-spin"
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
              )}
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
