import React, { useState, useEffect } from 'react';
import { updateProduct, type Product } from '../../api/products';

export interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onProductSaved?: (product: Product) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onProductSaved,
}) => {
  const [formData, setFormData] = useState({
    description: '',
    unit: 'pc',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const MAX_DESC_LENGTH = 30;

  // Pre-fill form when product changes or modal opens
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        description: product.description || '',
        unit: product.unit || 'pc',
      });
      setErrors({});
    }
  }, [isOpen, product]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
      const updatedProduct = await updateProduct(product.prodcode, {
        description: formData.description || null,
        unit: formData.unit || null,
      });

      setErrors({});

      // Notify parent component
      if (onProductSaved) {
        onProductSaved(updatedProduct);
      }

      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      setErrors((prev) => ({
        ...prev,
        submit: 'Failed to save product. Please try again.',
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
      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-surface-container-low flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight text-on-surface font-headline">
            Edit Product
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container-low active:scale-95 duration-200 disabled:opacity-50"
            aria-label="Close modal"
          >
            <span
              className="material-symbols-outlined"
              data-icon="close"
            >
              close
            </span>
          </button>
        </div>

        {/* Modal Body (Form Fields) */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Product Code (Read-Only) */}
            <div>
              <label
                className="block text-xs font-medium text-on-surface-variant uppercase tracking-widest mb-1.5"
                htmlFor="product-code"
              >
                Product Code
              </label>
              <div className="relative">
                <input
                  id="product-code"
                  type="text"
                  disabled
                  value={product.prodcode}
                  className="block w-full rounded-lg bg-surface-container-low text-on-surface-variant shadow-sm opacity-70 cursor-not-allowed sm:text-sm px-4 py-2.5 outline-none"
                  aria-readonly="true"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="flex items-center gap-1 text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold bg-surface-container px-2 py-0.5 rounded-sm opacity-60">
                    <span
                      className="material-symbols-outlined text-[12px]"
                      data-icon="lock"
                    >
                      lock
                    </span>
                    Read-only
                  </div>
                </div>
              </div>
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
                className={`block w-full rounded-lg bg-surface-container-highest text-on-surface shadow-sm focus:ring focus:ring-opacity-20 sm:text-sm outline-none transition-all ${
                  errors.description
                    ? 'border-error focus:border-error focus:ring-error'
                    : 'border-outline-variant/10 focus:border-primary focus:ring-primary'
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
                  className={`block w-full rounded-lg bg-surface-container-highest text-on-surface shadow-sm focus:ring focus:ring-opacity-20 sm:text-sm appearance-none py-2.5 pl-3 pr-10 outline-none transition-all ${
                    errors.unit
                      ? 'border-error focus:border-error focus:ring-error'
                      : 'border-outline-variant/10 focus:border-primary focus:ring-primary'
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
        <div className="px-6 py-4 bg-surface-container-lowest border-t border-surface-container-low flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex justify-center items-center px-4 py-2 text-sm font-semibold text-on-surface bg-surface-container-low rounded-md hover:bg-surface-container-high transition-colors active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="inline-flex justify-center items-center px-4 py-2 text-sm font-semibold text-surface-container-lowest bg-gradient-to-b from-primary to-primary-dim rounded-md hover:brightness-110 transition-all shadow-sm active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 gap-2"
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
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
