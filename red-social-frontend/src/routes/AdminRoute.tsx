import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

export default function AdminRoute() {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "admin" && user.role !== "moderator") {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}
