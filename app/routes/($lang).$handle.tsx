import { Outlet } from "react-router";

export default function UserLayout() {
  return (
    <main className="h-full flex justify-center grow bg-background">
      <Outlet />
    </main>
  );
}
