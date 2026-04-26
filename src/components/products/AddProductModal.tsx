import React, { useState } from 'react';
import { addProduct, type Product } from '../../api/products';

export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: (product: Product) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
}) => {
  const [formData, setFormData] = useState({
    prodcode: '',
    description: '',
    unit: 'pc',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const MAX_CODE_LENGTH = 6;
  const MAX_DESC_LENGTH = 30;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.prodcode.trim()) {
      newErrors.prodcode = 'Product code is required';
    } else if (formData.prodcode.length !== MAX_CODE_LENGTH) {
      newErrors.prodcode = `Product code must be ${MAX_CODE_LENGTH} characters`;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'prodcode' && value.length > MAX_CODE_LENGTH) {
      return;
    }
    if (name === 'description' && value.length > MAX_DESC_LENGTH) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const newProduct = await addProduct({
        prodcode: formData.prodcode,
        description: formData.description || null,
        unit: formData.unit || null,
        record_status: 'ACTIVE',
      });

      // Reset form
      setFormData({
        prodcode: '',
        description: '',
        unit: 'pc',
      });
      setErrors({});

      // Notify parent component
      if (onProductAdded) {
        onProductAdded(newProduct);
      }

      onClose();
    } catch (error) {
      console.error('Error adding product:', error);
      setErrors((prev) => ({
        ...prev,
        submit: 'Failed to add product. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: 'rgba(42, 52, 57, 0.4)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={handleBackdropClick}
    >
      {/* Modal Dialog */}
      <div className="bg-white/95 border border-blue-100 w-full max-w-md rounded-[28px] shadow-[0_24px_80px_-40px_rgba(19,83,216,0.32)] overflow-hidden flex flex-col max-h-[795px]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-blue-100 flex justify-between items-center bg-blue-50">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Add Product
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-primary hover:bg-primary/10 transition-colors p-2 rounded-full"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body (Form Fields) */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Product Code Field */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label
                  className="block text-sm font-medium text-on-surface"
                  htmlFor="product-code"
                >
                  Product Code
                </label>
                <span className={`text-xs font-medium ${
                  errors.prodcode ? 'text-error' : 'text-on-surface-variant'
                }`}>
                  {formData.prodcode.length}/{MAX_CODE_LENGTH}
                </span>
              </div>
              <div className="relative">
                <input
                  id="product-code"
                  name="prodcode"
                  type="text"
                  value={formData.prodcode}
                  onChange={handleInputChange}
                  aria-invalid={!!errors.prodcode}
                  aria-describedby={errors.prodcode ? 'code-error' : undefined}
                  className={`block w-full rounded-2xl bg-slate-50 text-slate-950 shadow-sm focus:ring-2 focus:ring-primary/20 sm:text-sm pr-10 outline-none transition-shadow ${
                    errors.prodcode
                      ? 'border-error focus:border-error focus:ring-error'
                      : 'border-slate-200 focus:border-primary border focus:ring-primary/20'
                  }`}
                  placeholder="Enter 6-character code"
                />
                {errors.prodcode && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span
                      className="material-symbols-outlined text-error text-sm"
                      data-icon="error"
                    >
                      error
                    </span>
                  </div>
                )}
              </div>
              {errors.prodcode && (
                <p
                  id="code-error"
                  className="mt-2 text-xs text-error font-medium flex items-center gap-1"
                >
                  {errors.prodcode}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label
                  className="block text-sm font-medium text-on-surface"
                  htmlFor="description"
                >
                  Description
                </label>
                <span className={`text-xs font-medium ${
                  errors.description ? 'text-error' : 'text-on-surface-variant'
                }`}>
                  {formData.description.length}/{MAX_DESC_LENGTH}
                </span>
              </div>
              <input
                id="description"
                name="description"
                type="text"
                value={formData.description}
                onChange={handleInputChange}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'desc-error' : undefined}
                className={`block w-full rounded-2xl bg-slate-50 text-slate-950 shadow-sm focus:ring-2 focus:ring-primary/20 sm:text-sm outline-none transition-shadow ${
                  errors.description
                    ? 'border-error focus:border-error focus:ring-error'
                    : 'border-slate-200 focus:border-primary border focus:ring-primary/20'
                }`}
                placeholder="Enter product description"
              />
              {errors.description && (
                <p
                  id="desc-error"
                  className="mt-2 text-xs text-error font-medium"
                >
                  {errors.description}
                </p>
              )}
            </div>

            {/* Unit Field */}
            <div>
              <label
                className="block text-sm font-medium text-on-surface mb-1.5"
                htmlFor="unit"
              >
                Unit
              </label>
              <div className="relative">
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  aria-invalid={!!errors.unit}
                  aria-describedby={errors.unit ? 'unit-error' : undefined}
                  className={`block w-full rounded-2xl bg-slate-50 text-slate-950 shadow-sm focus:ring-2 focus:ring-primary/20 sm:text-sm appearance-none py-2.5 pl-3 pr-10 outline-none transition-shadow ${
                    errors.unit
                      ? 'border-error focus:border-error focus:ring-error'
                      : 'border-slate-200 focus:border-primary border focus:ring-primary/20'
                  }`}
                >
                  <option value="pc">pc</option>
                  <option value="ea">ea</option>
                  <option value="mtr">mtr</option>
                  <option value="pkg">pkg</option>
                  <option value="ltr">ltr</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                  <span
                    className="material-symbols-outlined"
                    data-icon="expand_more"
                  >
                    expand_more
                  </span>
                </div>
              </div>
              {errors.unit && (
                <p
                  id="unit-error"
                  className="mt-2 text-xs text-error font-medium"
                >
                  {errors.unit}
                </p>
              )}
            </div>

            {/* Submit error message */}
            {errors.submit && (
              <div className="p-3 bg-error/10 border border-error rounded-lg">
                <p className="text-sm text-error">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer (Actions) */}
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-100 flex justify-end gap-3 rounded-b-[28px]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex justify-center items-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="inline-flex justify-center items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-primary to-primary-dim rounded-2xl hover:brightness-105 transition-all shadow-sm active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
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
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
};
