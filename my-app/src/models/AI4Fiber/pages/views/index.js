import React, { useState } from "react";
import { Flex, Layout, Button } from "antd";
import "./index.css";
import { test, test2 } from "../../api/test";
import { setStirrerSpeed } from "../../api/stirrer";
let a = 0;
let retu = {};
const recive = () => {
    let data = {
        STIRRER_ONE: "true",
        STIRRER_TWO: "true",
    };
    retu = setStirrerSpeed(data);
    console.log("retu", retu);
};

const App = () => {
    return (
        <Flex gap="middle" wrap className="container">
            <Button onClick={recive}>测试调用接口</Button>
            <p>{a}</p>
        </Flex>
    );
};
export default App;
