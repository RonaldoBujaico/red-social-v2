import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/auth/Login";
import Home from "@/pages/private/Home";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Register from "@/pages/auth/Register";
import Verify from "@/pages/auth/Verify";
import MyPosts from "@/pages/private/MyPosts";
import Messages from "@/pages/private/Messages";
import Settings from "@/pages/private/Setting";
import Profile from "@/pages/private/Profile";
import UserProfile from "@/pages/private/UserProfile";
import Notifications from "@/pages/private/Notifications";
import Explore from "@/pages/private/Explore";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminUserDetail from "@/pages/admin/AdminUserDetail";
import AdminReports from "@/pages/admin/AdminReports";
import AdminContent from "@/pages/admin/AdminContent";
import AdminStats from "@/pages/admin/AdminStats";
import AdminAudit from "@/pages/admin/AdminAudit";
import AdminConfig from "@/pages/admin/AdminConfig";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="*" element={<Navigate to="/login" replace />} />
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify" element={<Verify />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/my-posts" element={<MyPosts />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/users/:id" element={<UserProfile />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* Admin Panel - solo para admin y moderator */}
                    <Route element={<AdminRoute />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/users" element={<AdminUsers />} />
                            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
                            <Route path="/admin/reports" element={<AdminReports />} />
                            <Route path="/admin/content" element={<AdminContent />} />
                            <Route path="/admin/stats" element={<AdminStats />} />
                            <Route path="/admin/audit" element={<AdminAudit />} />
                            <Route path="/admin/config" element={<AdminConfig />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
