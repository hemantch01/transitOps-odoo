import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Shell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-60 flex flex-1 flex-col transition-all duration-300">
        <Header />
        <main className="flex-1 p-6 page-bg animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
