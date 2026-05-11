/**
 * @file components/products/OverwritePriceModal.tsx
 * @description Confirmation dialog shown when a price change conflicts with
 * an existing entry for today's date.
 *
 * This is a purely presentational component — it displays a warning message
 * and two actions (Cancel / Yes, Overwrite). The actual overwrite logic
 * is handled by the parent EditProductModal.
 *
 * Rendered at z-index 60 (above EditProductModal's z-50) to layer correctly.
 *
 * @see {@link ./EditProductModal.tsx} — Parent that controls this modal
 */
import React from 'react';

/**
 * Props for the OverwritePriceModal component.
 */
interface OverwritePriceModalProps {
  /** Controls modal visibility. */
  isOpen: boolean;
  /** Called when the user cancels the overwrite. */
  onClose: () => void;
  /** Called when the user confirms the overwrite. */
  onConfirm: () => void;
  /** Whether the overwrite operation is in progress (disables buttons, shows spinner). */
  isLoading: boolean;
}

export const OverwritePriceModal: React.FC<OverwritePriceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(42, 52, 57, 0.6)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-amber-600 text-3xl" data-icon="warning">
              warning
            </span>
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">Overwrite Price History?</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            A price change has already been recorded for today. 
            This change will overwrite the price history of this day. Proceed?
          </p>
        </div>
        <div className="px-6 py-4 bg-surface-container-low flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-semibold text-on-surface bg-white border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Yes, Overwrite
          </button>
        </div>
      </div>
    </div>
  );
};
