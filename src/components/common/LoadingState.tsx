type LoadingStateProps = {
  message?: string;
  className?: string;
};

function LoadingState({
  message = "Cargando información...",
  className = "min-h-48",
}: LoadingStateProps) {
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
          {message}
        </p>
      </div>
    </div>
  );
}

export default LoadingState;
