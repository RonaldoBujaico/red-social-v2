const AppearanceTab = () => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Appearance</h2>

            <select className="w-full p-3 rounded bg-background border border-border">
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
            </select>
        </div>
    );
};

export default AppearanceTab;
