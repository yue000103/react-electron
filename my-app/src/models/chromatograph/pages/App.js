import React, { useState } from "react";

import "./App.css";
import Choramatograph from "./views/index";
import Method from "./method/index";
import Historical from "./historical/index";
import SystemSet from "./systemSet/index";
import SystemSettings from "./systemSettings/index";
import { Layout } from "antd";
import {
    ExperimentOutlined,
    ProfileOutlined,
    ToolOutlined,
    SettingOutlined,
} from "@ant-design/icons";

import pkuImage from "@/assets/image/pku.png";
import "@components/css/overlay.css";

const { Header, Content } = Layout;

const NAV_ITEMS = [
    {
        key: "experiment",
        label: "运行",
        icon: ExperimentOutlined,
    },
    {
        key: "method",
        label: "方法",
        icon: ToolOutlined,
    },
    {
        key: "historical",
        label: "历史",
        icon: ProfileOutlined,
    },
    {
        key: "settings",
        label: "设置",
        icon: SettingOutlined,
    },
];

function App() {
    const [activeView, setActiveView] = useState("experiment");
    const renderActiveView = () => {
        switch (activeView) {
            case "method":
                return <Method />;
            case "historical":
                return <Historical />;
            case "settings":
                return <SystemSettings />;
            default:
                return <Choramatograph />;
        }
    };

    return (
        <Layout className="appShell">
            {/* 顶部：品牌栏 */}
            <Header className="appHeader">
                <div className="brandBlock">
                    {/* <img src={pkuImage} alt="pku" className="brandLogo" /> */}
                    <div className="brandInfo">
                        <h1>郗智科技 - 智能控制终端</h1>
                    </div>
                </div>
            </Header>

            {/* 中间：核心操作区，独立滚动 */}
            <Content className="appContent">
                <div
                    className="appView appViewActive"
                    key={`active-${activeView}`}
                >
                    {renderActiveView()}
                </div>
            </Content>

            {/* 底部：硬核导航栏 */}
            <nav className="appBottomBar">
                {NAV_ITEMS.map(({ key, label, icon: IconComponent }) => (
                    <button
                        key={key}
                        className={`industrialBtn${activeView === key ? " industrialBtn--active" : ""}`}
                        onClick={() => setActiveView(key)}
                        type="button"
                    >
                        <IconComponent className="industrialBtn__icon" />
                        <span className="industrialBtn__label">{label}</span>
                    </button>
                ))}
            </nav>
        </Layout>
    );
}

export default App;
