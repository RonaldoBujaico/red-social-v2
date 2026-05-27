export function initTheme() {
    const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
    ).matches;

    if (systemDark) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}
