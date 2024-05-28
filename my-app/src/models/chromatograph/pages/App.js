import logo from "./logo.svg";
import "./App.css";
import Choramatograph from "./views/index";
import Test from "./views/test";
import * as AntDesign from "antd";

function App() {
    const { Button, Input, Form, Modal, Table, Row, Flex, Layout } = AntDesign;

    return (
        <div className="App">
            <Choramatograph></Choramatograph>
            {/* <Test></Test> */}
        </div>
    );
}

export default App;
