import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type AppModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  maxWidthClassName?: string;
  isSubmitting?: boolean;
};

function AppModal({
  isOpen,
  title,
  description,
  children,
  onClose,
  maxWidthClassName = "max-w-2xl",
  isSubmitting = false,
}: AppModalProps) {
  const titleId = useId();
  const descId = useId();

  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElement =
    useRef<HTMLElement | null>(null);

  /*
   * Guardamos siempre las versiones más recientes
   * sin obligar al efecto principal del modal
   * a ejecutarse nuevamente.
   */
  const onCloseRef = useRef(onClose);
  const isSubmittingRef = useRef(isSubmitting);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  /*
   * Este efecto debe ejecutarse únicamente
   * cuando el modal se abre o se cierra.
   *
   * NO debe reiniciarse cada vez que cambia
   * un input del formulario.
   */
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current =
      document.activeElement as HTMLElement | null;

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        !isSubmittingRef.current
      ) {
        event.stopPropagation();
        onCloseRef.current();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    /*
     * Al abrir un formulario preferimos enfocar
     * el primer campo editable y no la X.
     */
    const timer = window.setTimeout(() => {
      if (!modalRef.current) return;

      if (
        modalRef.current.contains(
          document.activeElement,
        )
      ) {
        return;
      }

      const firstFormField =
        modalRef.current.querySelector<HTMLElement>(
          [
            "[data-autofocus]",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
          ].join(", "),
        );

      const firstFocusable =
        firstFormField ??
        modalRef.current.querySelector<HTMLElement>(
          [
            "button:not([disabled])",
            "[href]",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            '[tabindex]:not([tabindex="-1"])',
          ].join(", "),
        );

      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        modalRef.current.focus();
      }
    }, 50);

    return () => {
      window.clearTimeout(timer);

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        originalOverflow;

      if (
        previousActiveElement.current &&
        typeof previousActiveElement.current
          .focus === "function"
      ) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
      role="presentation"
    >
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => {
          if (!isSubmitting) {
            onClose();
          }
        }}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={
          description ? descId : undefined
        }
        tabIndex={-1}
        className={`relative z-10 flex max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] w-full ${maxWidthClassName} flex-col rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white shadow-2xl outline-none`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="text-lg font-bold text-zinc-950 sm:text-xl md:text-2xl"
            >
              {title}
            </h2>

            {description ? (
              <p
                id={descId}
                className="mt-1 text-xs text-zinc-600 sm:text-sm"
              >
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl font-bold leading-none text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Cerrar modal"
            title="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default AppModal;