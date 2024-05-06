import React from "react";
import Button from "./button";
import Image from "./image";
import Tube from "./tube";
import "./home.css";
import { Layout, Flex } from "antd";
const { Header, Footer, Sider, Content } = Layout;
const headerStyle = {
    textAlign: "center",
    color: "#fff",
    height: 64,
    paddingInline: 48,
    lineHeight: "64px",
    backgroundColor: "#4096ff",
};
const App = () => (
    // <div className="content">
    //     <p>我是主页</p>
    //     <Button className="but"></Button>
    //     <Image className="img"></Image>
    //     <Tube className="tube"></Tube>
    // </div>
    <Flex gap="middle" wrap="wrap">
        <Layout className="main">
            <Header style={headerStyle}>
                {" "}
                <Image className="img"></Image>
            </Header>
            <Layout>
                <Sider>
                    {" "}
                    <Button className="but"></Button>
                </Sider>
                <Sider>
                    <Tube className="tube"></Tube>
                </Sider>
            </Layout>
        </Layout>
    </Flex>
);
export default App;
