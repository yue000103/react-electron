import React, { useState } from "react";

import logo from "./logo.svg";
import "./App.css";
import Choramatograph from "./views/index";
import Method from "./method/index";
import Test from "./views/test";
import { Radio, Space, Tabs, Row, Col, Flex, Layout, Anchor } from "antd";
import Clock from "@components/clock/index";

import pkuImage from "@/assets/image/pku.png";
import "@components/css/overlay.css";

function App() {
    const { Link } = Anchor;

    const [showExperiment, setShowExperiment] = useState(false);
    const [showMethod, setShowMethod] = useState(false);
    const [showHistorical, setShowHistorical] = useState(false);

    const handleClick = (e, link) => {
        e.preventDefault();
        console.log(link);
        if (Number(link["href"].substring(1)) === 1) {
            setShowMethod(true);
            setShowExperiment(false);
        } else {
            setShowExperiment(true);
            setShowMethod(false);
        }
    };

    return (
        <Flex gap="middle" wrap className="container">
            <Layout className="layoutStyle">
                <Row>
                    <div className="title">
                        {" "}
                        <img src={pkuImage} alt="pku" className="image" />
                        <div className="titleText">
                            <h3>Chromatography Instrument</h3>
                        </div>
                        <div className="titleClock">
                            <Clock></Clock>
                        </div>
                    </div>
                </Row>
                <Row>
                    <Col span={1}>
                        <Anchor
                            affix={true}
                            onClick={handleClick}
                            getCurrentAnchor="red"
                            className="custom-anchor"
                            defaultActiveKey="1" // 设置初始高亮的锚点
                            items={[
                                {
                                    key: "1",
                                    href: "#1",
                                    title: (
                                        <div className="anchor-item">
                                            方&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;法
                                        </div>
                                    ),
                                },
                                {
                                    key: "2",
                                    href: "#2",
                                    title: (
                                        <div className="anchor-item">
                                            实&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;验
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </Col>
                    <Col span={22}>
                        {showExperiment ? <Choramatograph /> : null}{" "}
                        {showMethod ? <Method /> : null}{" "}
                        {showHistorical ? <div /> : null}{" "}
                    </Col>
                </Row>
                {/* <Test></Test> */}
            </Layout>
        </Flex>
    );
}

export default App;
