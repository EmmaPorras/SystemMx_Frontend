import { useTranslation } from "react-i18next";

type LoadingStateProps = {
  message?: string;
  className?: string;
};

function LoadingState({
  message,
  className = "min-h-48",
}: LoadingStateProps) {
  const { t } = useTranslation();
  const resolvedMessage = message ?? t("common.loadingInfo");

  return (
    <div
      role="status"
      aria-live="polite"
      className={`grid place-items-center ${className}`}
    >
      <div className="text-center">
        <div
          aria-hidden="true"
          className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950"
        />

        <p className="mt-3 text-sm font-semibold text-zinc-600">
          {resolvedMessage}
        </p>
      </div>
    </div>
  );
}

export default LoadingState;
