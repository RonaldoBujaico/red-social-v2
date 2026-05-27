const PrivacyTab = () => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Privacy</h2>

            <label className="flex items-center justify-between">
                <span>Cuenta privada</span>
                <input type="checkbox" />
            </label>

            <label className="flex items-center justify-between">
                <span>Mostrar estado en línea</span>
                <input type="checkbox" />
            </label>
        </div>
    );
};
export default PrivacyTab;
