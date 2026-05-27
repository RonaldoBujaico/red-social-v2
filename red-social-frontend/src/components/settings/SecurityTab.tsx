const SecurityTab = () => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Security</h2>

            <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg">
                Cambiar contraseña
            </button>

            <button className="bg-red-500 text-white px-4 py-2 rounded-lg">
                Cerrar todas las sesiones
            </button>
        </div>
    );
};
export default SecurityTab;
