import { Outlet } from "react-router";

export default function UserLayout() {
  return (
    <main className="h-full bg-background w-full">
      <Outlet />
    </main>
  );
}
