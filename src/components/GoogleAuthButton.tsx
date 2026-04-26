import { useState } from 'react';

interface GoogleAuthButtonProps {
  loading: boolean;
  error?: string;
  onClick: () => void;
  isMobile?: boolean;
}

export default function GoogleAuthButton({
  loading,
  error,
  onClick,
}: GoogleAuthButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonBaseClasses = 'flex w-full items-center justify-center gap-3 rounded-lg transition-all duration-200 font-medium';

  const getButtonClasses = () => {
    if (error) {
      return `${buttonBaseClasses} py-3 px-4 bg-[#f0f4f7] text-[#2a3439] border border-[#9e3f4e]/20`;
    }

    if (loading) {
      return `${buttonBaseClasses} py-3 px-4 bg-[#f0f4f7] text-[#566166]/50 cursor-wait opacity-80`;
    }

    if (isHovered) {
      return `${buttonBaseClasses} py-3 px-4 bg-[#d9e4ea] text-[#2a3439] font-semibold ring-2 ring-[#1353d8]/10 scale-[1.02]`;
    }

    return `${buttonBaseClasses} py-3 px-4 bg-[#f0f4f7] text-[#2a3439] hover:bg-[#e1e9ee] active:scale-[0.98]`;
  };

  return (
    <div className="space-y-3">
      <button
        onClick={onClick}
        disabled={loading || !!error}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={getButtonClasses()}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-[#1353d8]"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm">Authenticating...</span>
          </>
        ) : (
          <>
            <img
              alt="Google"
              className="h-4 w-4"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZ3t3qE6PXPzJ8bKRX0Pw53D1nNBxwLbsp941PCy7Sr3ITG-l2zW1aEF2jJMFtNP9S4sAatsvssWivdjSLMQIeATmrEm4nA6oPBY79aRSG-NcH9zDz--cJr-qmoAdbQ6j-mwHDLNMCbUve5Vku9eZOozLuS8q_tXQ7QIOopRbN8iNbCwNkdzjAlSl35WJjKBm-8K9JRkAT8VDsufOshuicadYZRbpLlBY6ZyVvAu4E5lx7Gw9fjzRk2ZCXt_sMOdaVTD3xL5sekW0"
            />
            <span className="text-sm">Continue with Google Account</span>
          </>
        )}
      </button>

      {/* Error Message Display */}
      {error && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-[#9e3f4e] text-base">⚠</span>
          <span className="text-[11px] text-[#9e3f4e] font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
