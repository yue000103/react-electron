import logo from "./logo.svg";
import "./App.css";
import Choramatograph from "./views/index";
import * as AntDesign from "antd";

function App() {
    const { Button, Input, Form, Modal, Table, Row, Flex, Layout } = AntDesign;

    return (
        <div className="App">
            <Choramatograph></Choramatograph>
        </div>
    );
}

export default App;
