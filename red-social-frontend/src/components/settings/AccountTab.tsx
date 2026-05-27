const AccountTab = () => {
    return (
        <>
            <div className="flex-1 bg-card border border-border rounded-2xl p-6 shadow">
                <h2 className="text-xl font-semibold text-white">
                    Información de Perfil
                </h2>
                <form className="flex gap-2 flex-col justify-between items-start ">
                    <label htmlFor="firstName" className="mt-2 font-semibold">
                        Nombres
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="Nombre"
                        className="w-full p-3 rounded-xl bg-background border border-border"
                    />
                    <label htmlFor="lastName" className="mt-2 font-semibold">
                        Apellidos
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Apellidos"
                        className="w-full p-3 rounded-xl bg-background border border-border"
                    />
                    <label htmlFor="username" className="mt-2 font-semibold">
                        Nombre de Usuario
                    </label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Nombre de Usuario"
                        className="w-full p-3 rounded-xl bg-background border border-border"
                    />
                    <label htmlFor="email" className="mt-2 font-semibold">
                        Correo
                    </label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Correo"
                        className="w-full p-3 rounded-xl bg-background border border-border"
                    />

                    <label htmlFor="bio" className="mt-2 font-semibold">
                        Biografía
                    </label>

                    <input
                        type="text"
                        name="bio"
                        placeholder="Bio"
                        className="w-full p-3 rounded-xl bg-background border border-border"
                    />

                    <button className="bg-primary rounded-xl text-black px-4 py-2 mt-4 font-semibold">
                        Guardar cambios
                    </button>
                </form>
            </div>

            <div className="flex-1 bg-card border border-border rounded-2xl p-6 shadow">
                <h2 className="text-xl font-semibold text-white">
                    Cambiar Contraseña
                </h2>
                <form className="flex gap-2 flex-col justify-between items-start ">
                    <label htmlFor="password" className="mt-2 font-semibold">
                        Contraseña Actual
                    </label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña Actual"
                        className="w-full p-3 rounded-xl bg-background border border-border"
                    />
                    <label htmlFor="newPassword" className="mt-2 font-semibold">
                        Contraseña Nueva
                    </label>
                    <input
                        type="password"
                        name="newPassword"
                        placeholder="Contraseña Nueva"
                        className="w-full p-3 rounded-xl bg-background border border-border"
                    />
                    <label
                        htmlFor="confirmPassword"
                        className="mt-2 font-semibold"
                    >
                        Confirmar Contraseña
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirmar Contraseña"
                        className="w-full p-3 rounded-xl bg-background border border-border"
                    />
                    <button className="bg-primary rounded-xl text-black px-4 py-2 mt-4 font-semibold">
                        Actualizar Contraseña
                    </button>
                </form>
            </div>
        </>
    );
};
export default AccountTab;
