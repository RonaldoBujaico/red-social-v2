import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] text-white p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <img
                    src="https://franklinbelen.com/wp-content/uploads/cual-es-el-error-404-not-fund.jpg"
                    alt="404 Not Found"
                    className="rounded-2xl shadow-lg w-full object-cover"
                />

                <h1 className="text-3xl font-bold">
                    404 - Página no encontrada
                </h1>

                <p className="text-gray-400 text-sm">
                    La página que buscas no existe o fue movida 👀
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
