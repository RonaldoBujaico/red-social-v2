import { Link } from "react-router-dom";

export default function Maintenance() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] text-white p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <img
                    src="https://thumbs.dreamstime.com/b/el-perro-del-barro-amasado-con-el-casco-de-seguridad-amarillo-del-constructor-y-la-se%C3%B1al-de-peligro-con-el-texto-se-cerraron-para-92995812.jpg"
                    alt="En mantenimiento"
                    className="rounded-2xl shadow-lg w-full object-cover"
                />

                <h1 className="text-2xl font-bold">
                    🚧 Estamos en mantenimiento
                </h1>

                <p className="text-gray-400 text-sm">
                    Estamos trabajando para mejorar esta sección. Vuelve más
                    tarde 🛠️
                </p>

                <Link
                    to="/home"
                    className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-full transition"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}
