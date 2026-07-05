import { Link } from "react-router";

type MenuCardProps = {
  title: string;
  to: string;
  icon: string;
  colorClass: string;
};

function MenuCard({ title, to, icon, colorClass }: MenuCardProps) {
  return (
    <Link
      to={to}
      className={`${colorClass} flex min-h-[190px] flex-col items-center justify-center rounded-md p-6 text-white shadow-md transition hover:scale-[1.02]`}
    >
      <div className="mb-4 text-5xl">{icon}</div>
      <h2 className="text-2xl font-semibold text-center">{title}</h2>
    </Link>
  );
}

export default MenuCard;