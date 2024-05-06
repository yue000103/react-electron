import "./test.css";
import test1 from "./test1.jpg";
// import { Button } from "antd";

function test() {
    return (
        <div className="test">
            <h1>💖 welcome to Mo's group!</h1>
            <p>here is the first demo on 2024.4.29.</p>
            <div className="t2">
                <img src={test1}></img>
            </div>
            {/* <Button type="dashed"></Button> */}
        </div>
    );
}

export default test;
// import React from "react";
// import { ConfigProvider } from "antd";

// const App = () => (
//     <ConfigProvider theme={{ token: { colorPrimary: "#00b96b" } }}>
//         <Button type="primary"></Button>
//     </ConfigProvider>
// );

// export default App;
// import React from "react";
// import { QuestionCircleOutlined } from "@ant-design/icons";
// import { FloatButton } from "antd";
// const App = () => (
//     <>
//         <FloatButton
//             icon={<QuestionCircleOutlined />}
//             type="primary"
//             style={{
//                 right: 24,
//             }}
//         />
//         <FloatButton
//             icon={<QuestionCircleOutlined />}
//             type="default"
//             style={{
//                 right: 94,
//             }}
//         />
//     </>
// );
// export default App;
