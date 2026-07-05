type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
      </div>

      {children}
    </section>
  );
}

export default SectionCard;
