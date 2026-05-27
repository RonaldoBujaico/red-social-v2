import { useAuthStore } from "@/store/auth.store";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:opacity-90 transition"
        >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
        </button>
    );
}
