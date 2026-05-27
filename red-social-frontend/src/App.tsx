import AppRouter from "./routes/AppRouter";
import { useEffect } from "react";
import { initTheme } from "./store/theme.store";

export default function App() {
    useEffect(() => {
        initTheme();
    }, []);

    return <AppRouter />;
}
