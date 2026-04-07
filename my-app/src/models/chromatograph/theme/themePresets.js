/**
 * 影刃：Chromatograph 双主题预设
 * dark  — 工业暗黑风（深色背景 + 青色强调）
 * light — 明亮系（白色背景 + 红色强调）
 */

const dark = {
    key: "dark",
    label: "暗色",

    // antd ConfigProvider token
    antd: {
        colorPrimary: "#00E5FF",
        colorBgContainer: "#151A25",
        colorBgElevated: "#1A2030",
        colorBgLayout: "#0B101E",
        colorBorder: "#2A3444",
        colorText: "#E8ECF1",
        colorTextSecondary: "#A0AEC0",
        borderRadius: 6,
    },

    // CSS 变量 —— key 即 `--${key}`
    vars: {
        "brand-color": "#00E5FF",
        "brand-secondary": "#00B8D4",
        "brand-rgb": "0, 229, 255",

        "body-bg": "#06080F",
        "layout-bg": "#0B101E",
        "card-bg": "#151A25",
        "hover-bg": "#1C2333",
        "surface-raised": "#1A2030",

        "text-primary": "#E8ECF1",
        "text-secondary": "#A0AEC0",
        "text-muted": "#606D80",
        "text-disabled": "#3A4556",

        "border-color": "#2A3444",
        "border-color-light": "#1E2836",
        "border-glow": "rgba(0, 229, 255, 0.15)",

        "shadow-sm": "0 2px 8px rgba(0, 0, 0, 0.4)",
        "shadow-md": "0 4px 12px rgba(0, 0, 0, 0.5)",
        "shadow-lg": "0 8px 24px rgba(0, 0, 0, 0.6)",
        "glow-brand": "0 0 15px rgba(0, 229, 255, 0.3)",

        // 激活态渐变
        "brand-bg-dark": "#002A33",
        "brand-bg-mid": "#00404D",

        // 头部渐变
        "header-bg-1": "#0D1320",
        "header-bg-2": "#151D2E",
        "header-bg-3": "#1A2540",

        // 底栏渐变
        "bar-bg-1": "#0A0E18",
        "bar-bg-2": "#111827",

        // 面板渐变
        "panel-bg-1": "#1A2030",
        "panel-bg-2": "#151A25",

        // 输入框
        "input-bg": "rgba(0, 0, 0, 0.2)",

        // 开关 checked 渐变
        "switch-checked-bg-1": "#003D47",
        "switch-checked-bg-2": "#00262E",
    },
};

const light = {
    key: "light",
    label: "明亮",

    antd: {
        colorPrimary: "#E53E3E",
        colorBgContainer: "#FFFFFF",
        colorBgElevated: "#FFFFFF",
        colorBgLayout: "#F7F8FA",
        colorBorder: "#E2E8F0",
        colorText: "#1A202C",
        colorTextSecondary: "#4A5568",
        borderRadius: 6,
    },

    vars: {
        "brand-color": "#E53E3E",
        "brand-secondary": "#C53030",
        "brand-rgb": "229, 62, 62",

        "body-bg": "#F0F2F5",
        "layout-bg": "#F7F8FA",
        "card-bg": "#FFFFFF",
        "hover-bg": "#F0F2F5",
        "surface-raised": "#FAFBFC",

        "text-primary": "#1A202C",
        "text-secondary": "#4A5568",
        "text-muted": "#A0AEC0",
        "text-disabled": "#CBD5E0",

        "border-color": "#E2E8F0",
        "border-color-light": "#EDF2F7",
        "border-glow": "rgba(229, 62, 62, 0.12)",

        "shadow-sm": "0 1px 3px rgba(0, 0, 0, 0.08)",
        "shadow-md": "0 4px 6px rgba(0, 0, 0, 0.07)",
        "shadow-lg": "0 10px 15px rgba(0, 0, 0, 0.08)",
        "glow-brand": "0 0 15px rgba(229, 62, 62, 0.2)",

        "brand-bg-dark": "#FFF5F5",
        "brand-bg-mid": "#FED7D7",

        "header-bg-1": "#FFFFFF",
        "header-bg-2": "#FAFBFC",
        "header-bg-3": "#F7F8FA",

        "bar-bg-1": "#FFFFFF",
        "bar-bg-2": "#FAFBFC",

        "panel-bg-1": "#FAFBFC",
        "panel-bg-2": "#FFFFFF",

        "input-bg": "rgba(0, 0, 0, 0.02)",

        "switch-checked-bg-1": "#FFF5F5",
        "switch-checked-bg-2": "#FED7D7",
    },
};

export const THEME_PRESETS = { dark, light };
export const THEME_KEYS = Object.keys(THEME_PRESETS);
export default THEME_PRESETS;
