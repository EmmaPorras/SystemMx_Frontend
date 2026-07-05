type StatCardProps = {
  label: string;
  value: string;
  hint: string;
};

function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-zinc-900">{value}</p>
      <p className="mt-2 text-xs text-zinc-500">{hint}</p>
    </article>
  );
}

export default StatCard;
