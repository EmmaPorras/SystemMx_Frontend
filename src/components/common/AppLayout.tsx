import { Outlet } from "react-router";

function AppLayout() {
  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <main className="min-h-screen w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;