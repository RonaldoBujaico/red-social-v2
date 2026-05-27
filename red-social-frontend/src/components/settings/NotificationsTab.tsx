const NotificationsTab = () => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Notifications</h2>

            <label className="flex items-center justify-between">
                <span>Notificaciones por email</span>
                <input type="checkbox" />
            </label>

            <label className="flex items-center justify-between">
                <span>Notificaciones push</span>
                <input type="checkbox" />
            </label>
        </div>
    );
};
export default NotificationsTab;
