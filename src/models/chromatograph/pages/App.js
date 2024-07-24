import React, { useState } from "react";

import logo from "./logo.svg";
import "./App.css";
import Choramatograph from "./views/index";
import Method from "./method/index";
import Test from "./views/test";
import { Radio, Space, Tabs, Row, Col, Flex, Layout } from "antd";
import Clock from "@components/clock/index";

import pkuImage from "@/assets/image/pku.png";
import "@components/css/overlay.css";

function App() {
    const [showExperiment, setShowExperiment] = useState(false);
    const [showMethod, setShowMethod] = useState(false);
    const [showHistorical, setShowHistorical] = useState(false);

    const experiment = () => {
        console.log("experiment :");
        if (!showExperiment) {
            setShowExperiment(true);
            setShowMethod(false);
        }
    };

    const method = () => {
        console.log("method :", showMethod);

        if (!showMethod) {
            setShowMethod(true);
            setShowExperiment(false);
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
                        <div className="tag">
                            <div
                                className="tag_experiment"
                                onClick={() => method()}
                            >
                                方&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;法
                            </div>
                            <div
                                className="tag_experiment"
                                onClick={() => experiment()}
                            >
                                实&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;验
                            </div>

                            {/* <div
                                className="tag_historical"
                                onClick={() =>
                                    setShowHistorical(!showHistorical)
                                }
                            >
                                历史数据
                            </div> */}
                        </div>
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
