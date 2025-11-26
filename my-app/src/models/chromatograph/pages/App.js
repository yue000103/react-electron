import React, { useState } from "react";

import "./App.css";
import Choramatograph from "./views/index";
import Method from "./method/index";
import Historical from "./historical/index";
import { Layout, Menu } from "antd";
import {
    ExperimentOutlined,
    ProfileOutlined,
    ToolOutlined,
} from "@ant-design/icons";
// import Clock from "@components/clock/index";

import pkuImage from "@/assets/image/pku.png";
import "@components/css/overlay.css";

const { Header, Sider, Content } = Layout;

const NAV_ITEMS = [
    {
        key: "method",
        label: "方法设置",
        icon: ToolOutlined,
    },
    {
        key: "experiment",
        label: "实验监控",
        icon: ExperimentOutlined,
    },
    {
        key: "historical",
        label: "历史数据",
        icon: ProfileOutlined,
    },
];

const menuItems = NAV_ITEMS.map(({ key, label, icon: IconComponent }) => ({
    key,
    label: (
        <div className="navItemContent">
            <IconComponent className="navItemIcon" />
            <span className="navItemText">{label}</span>
        </div>
    ),
}));

function App() {
    const [activeView, setActiveView] = useState("experiment");

    const renderCurrentView = () => {
        switch (activeView) {
            case "method":
                return <Method />;
            case "historical":
                return <Historical />;
            default:
                return <Choramatograph />;
        }
    };

    return (
        <Layout className="appShell">
            <Header className="appHeader">
                <div className="brandBlock">
                    <img src={pkuImage} alt="pku" className="brandLogo" />
                    <div className="brandInfo">
                        <h1>Chromatography Instrument</h1>
                    </div>
                </div>
                {/* <div className="headerClock">
                    <Clock />
                </div> */}
            </Header>
            <Layout className="appBody">
                <Sider
                    className="appSider"
                    width={120}
                    breakpoint="lg"
                    collapsedWidth={64}
                >
                    <Menu
                        className="appNavMenu"
                        mode="inline"
                        theme="dark"
                        selectedKeys={[activeView]}
                        items={menuItems}
                        onClick={({ key }) => setActiveView(key)}
                        style={{ height: "100%" }}
                    />
                </Sider>
                <Content className="appContent">{renderCurrentView()}</Content>
            </Layout>
        </Layout>
    );
}

export default App;
