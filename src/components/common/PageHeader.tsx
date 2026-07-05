type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-500">{description}</p>
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export default PageHeader;
