import ThemeButton from "@/components/buttons/ThemeButton";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Outlet />
      </div>
      <div className="fixed bottom-6 right-6 z-[9999 flex gap-2" >
        <ThemeButton />

      </div>
    </>
  );
}