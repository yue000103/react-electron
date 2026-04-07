import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import THEME_PRESETS from "./themePresets";

const STORAGE_KEY = "chromatograph:theme-mode:v1";

const ThemeContext = createContext({
    mode: "dark",
    isDark: true,
    toggleTheme: () => {},
});

/**
 * 影刃：主题供应器
 * 1. 管理 dark/light 状态 + localStorage 持久化
 * 2. 动态注入 CSS 变量到 :root
 * 3. 包裹 antd ConfigProvider
 */
export function ThemeProvider({ children }) {
    const [mode, setMode] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && THEME_PRESETS[saved]) return saved;
        } catch {}
        return "dark";
    });

    const preset = THEME_PRESETS[mode];
    const isDark = mode === "dark";

    // 注入 CSS 变量
    useEffect(() => {
        const root = document.documentElement;
        const { vars } = preset;
        Object.entries(vars).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
        // body 背景色
        document.body.style.backgroundColor = vars["body-bg"];
        // 给 html/root 也设置一下，覆盖 App.css 中的 body,html,#root 选择器
        root.style.backgroundColor = vars["body-bg"];
        const rootEl = document.getElementById("root");
        if (rootEl) rootEl.style.backgroundColor = vars["body-bg"];
    }, [mode, preset]);

    const toggleTheme = () => {
        const next = isDark ? "light" : "dark";
        setMode(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {}
    };

    // antd 主题配置
    const antdThemeConfig = useMemo(() => ({
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
            ...preset.antd,
        },
    }), [isDark, preset]);

    const ctx = useMemo(() => ({ mode, isDark, toggleTheme }), [mode, isDark]);

    return (
        <ThemeContext.Provider value={ctx}>
            <ConfigProvider theme={antdThemeConfig}>
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

export default ThemeContext;
