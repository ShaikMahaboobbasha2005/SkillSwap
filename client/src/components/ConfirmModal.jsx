import Modal from "./Modal";
import { Loader2 } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title = "Unsaved Changes",
  message = "You have unsaved changes. Are you sure you want to discard them?",
  confirmText = "Discard Changes",
  cancelText = "Keep Editing",
  onConfirm,
  onCancel,
  isDestructive = false,
  variant = "primary",
  isProcessing = false,
  isLoading = false,
}) {
  const isDanger = isDestructive || variant === "destructive" || variant === "danger";
  const disabled = isProcessing || isLoading;

  const confirmBtnStyles = isDanger
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-[#1B4332] hover:bg-[#143326] text-white";

  return (
    <Modal isOpen={isOpen} onClose={disabled ? undefined : onCancel} maxWidth="max-w-sm" closeOnBackdrop={!disabled} closeOnEsc={!disabled}>
      <div className="p-6 flex flex-col space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-lg shrink-0">
            ⚠️
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#16160F]">{title}</h3>
            <p className="text-xs text-[#6B6858] mt-0.5">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E6E3DA]">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="px-3.5 py-2 text-xs font-semibold text-[#16160F] bg-[#F7F6F2] hover:bg-[#E4EEE8] border border-[#E6E3DA] rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all active:scale-[0.98] shadow-2xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 ${confirmBtnStyles}`}
          >
            {disabled ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
