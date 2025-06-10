import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Flex, Form, InputNumber, Steps, Row, Col, Card } from "antd";
import io from "socket.io-client";
import { blue, gray } from "@ant-design/colors"; // Ant Design的颜色库
import "./index.css";
const { Step } = Steps;

const App = () => {
    const [swaggerData, setSwaggerData] = useState(null);
    const [inputValues, setInputValues] = useState({});
    const [outputValues, setOutputValues] = useState({});
    const [loading, setLoading] = useState(false);
    const [temperature, setTemperature] = useState(0);
    const [vacuumValue, setVacuumValue] = useState(0);
    const [progressPoints, setProgressPoints] = useState([30, 60, 90]); // 三个温度进度点的默认值

    const currentStep =
        progressPoints.filter((point) => point <= temperature).length - 1;

    console.log("currentStep :", currentStep);

    const customDot = (dot, { status, index }) => {
        const pointValue = progressPoints[index];

        return (
            <span
                style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                }}
            >
                {dot}
            </span>
        );
    };

    useEffect(() => {
        // 这里可以放置你用来更新temperature和vacuumValue的逻辑
        // 比如从WebSocket或者API中获取实时数据
    }, [temperature, vacuumValue]);

    useEffect(() => {
        // 使用你的Swagger JSON文件的URL
        const swaggerUrl = "http://192.168.5.185:5000/swagger/";
        // const swaggerUrl = "http://localhost:5000/swagger/";
        // "http://192.168.5.155:5000/swagger/"
        // "http://127.0.0.1:5000/swagger-json/"
        axios
            .get(swaggerUrl)
            .then((response) => {
                console.log("response:", response);
                // 过滤掉以 /auto/ 开头的路径
                const filteredPaths = {};
                Object.entries(response.data.paths).forEach(
                    ([path, methods]) => {
                        if (!path.startsWith("/auto/")) {
                            filteredPaths[path] = methods;
                        }
                    }
                );

                const filteredData = {
                    ...response.data,
                    paths: filteredPaths,
                };

                setSwaggerData(filteredData);
            })
            .catch((error) =>
                console.error("Error fetching Swagger data:", error)
            );
    }, []);

    // useEffect(() => {
    //     const socket = io("http://192.168.5.185:5000/", {
    //         transports: ["polling", "websocket"], // 确保使用的传输方式与后端匹配
    //         withCredentials: true, // 如果CORS需要发送凭据
    //     }); // 确保 URL 正确
    //     socket.on("connect", () => {
    //         console.log("Connected to WebSocket server");
    //     });

    //     socket.on("current_vacuum_value", (current_vacuum_value) => {
    //         // console.log("current_vacuum_value", current_vacuum_value);
    //         setVacuumValue(current_vacuum_value.current_vacuum_value);
    //     });
    //     socket.on("current_temperature", (current_temperature) => {
    //         // console.log("current_temperature", current_temperature);
    //         setTemperature(current_temperature.current_temperature);
    //     });
    //     socket.on("signal", (signal) => {
    //         // console.log("signal", signal);
    //         setTemperature(signal.signal);
    //     });
    //     socket.on("temperature_list", (temperature_list) => {
    //         // console.log("temperature_list", temperature_list);
    //         setProgressPoints(temperature_list.temperature_list);
    //     });
    // });

    const handleInputChange = (path, paramName, value) => {
        // console.log("paramName :", paramName);

        setInputValues((prevValues) => ({
            ...prevValues,
            [path]: {
                ...prevValues[path],
                [paramName]: value,
            },
        }));
    };
    const handleArrayInputChange = (path, paramName, index, value) => {
        setInputValues((prevValues) => {
            const updatedArray = prevValues[path]?.[paramName]?.slice() || [];
            updatedArray[index] = value;
            return {
                ...prevValues,
                [path]: {
                    ...prevValues[path],
                    [paramName]: updatedArray,
                },
            };
        });
    };
    const renderArrayInputField = (path, paramName) => {
        const values = inputValues[path]?.[paramName] || [];

        return values.map((value, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
                <label style={{ marginRight: "10px" }}>
                    {paramName} [{index}]:
                </label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                        handleArrayInputChange(
                            path,
                            paramName,
                            index,
                            e.target.value
                        )
                    }
                />
                <button onClick={() => removeArrayItem(path, paramName, index)}>
                    Remove
                </button>
            </div>
        ));
    };

    // Function to add a new item to the array
    const addArrayItem = (path, paramName) => {
        setInputValues((prevValues) => {
            const updatedArray = prevValues[path]?.[paramName]?.slice() || [];
            updatedArray.push(""); // Add a new empty string to the array
            return {
                ...prevValues,
                [path]: {
                    ...prevValues[path],
                    [paramName]: updatedArray,
                },
            };
        });
    };

    // Function to remove an item from the array
    const removeArrayItem = (path, paramName, index) => {
        setInputValues((prevValues) => {
            const updatedArray = prevValues[path]?.[paramName]?.slice() || [];
            updatedArray.splice(index, 1); // Remove the item at the specified index
            return {
                ...prevValues,
                [path]: {
                    ...prevValues[path],
                    [paramName]: updatedArray,
                },
            };
        });
    };
    const handleSubmit = (path, method) => {
        // setLoading(true)
        setInputValues((prevValues) => ({
            ...prevValues,
            [path]: {
                ...prevValues[path],
                loading: true, // 设置loading状态
            },
        }));
        const operation = swaggerData.paths[path][method];
        const params = operation.parameters.reduce((acc, param) => {
            if (param.in === "body") {
                const schema =
                    swaggerData.definitions[param.schema.$ref.split("/").pop()];
                Object.keys(schema.properties).forEach((key) => {
                    if (!schema.properties[key].readOnly) {
                        acc[key] = inputValues[path]
                            ? inputValues[path][key]
                            : "";
                    }
                });
            } else {
                acc[param.name] = inputValues[path]
                    ? inputValues[path][param.name]
                    : "";
            }
            return acc;
        }, {});

        // console.log("path", path);
        // console.log("method", method);
        // console.log("params", params);

        // 替换路径中的占位符
        let dynamicPath = path;
        Object.keys(params).forEach((paramName) => {
            const paramValue = params[paramName];
            const placeholder = `{${paramName}}`;
            if (dynamicPath.includes(placeholder)) {
                dynamicPath = dynamicPath.replace(placeholder, paramValue);
                delete params[paramName]; // 删除已替换的参数
            }
        });

        let config = {};

        if (method === "get") {
            config = {
                method: method,
                url: `http://192.168.5.185:5000${dynamicPath}`,
                // url: `http://localhost:5000${dynamicPath}`,

                params: params, // 剩余查询参数
                headers: {},
            };
        } else {
            config = {
                method: method,
                url: `http://192.168.5.185:5000${dynamicPath}`,
                // url: `http://localhost:5000${dynamicPath}`,

                headers: { "Content-Type": "application/json" },
                data: params, // 设置数据字段
            };
        }

        // console.log("config", config);

        axios(config)
            .then((response) => {
                setOutputValues((prevValues) => ({
                    ...prevValues,
                    [path + method]: JSON.stringify(response.data, null, 2),
                }));
            })
            .catch((error) => {
                if (error.response) {
                    // 请求已发出，但服务器返回状态码不在 2xx 范围内
                    console.error(
                        "Server responded with non-2xx status:",
                        error.response.data
                    );
                    const errorMessage = error.response.data.message; // 获取错误信息
                    setOutputValues((prevValues) => ({
                        ...prevValues,
                        [path + method]: JSON.stringify(
                            { error: errorMessage },
                            null,
                            2
                        ), // 显示错误信息
                    }));
                } else if (error.request) {
                    // 请求已发出，但没有收到响应
                    console.error(
                        "No response received from server:",
                        error.request
                    );
                    setOutputValues((prevValues) => ({
                        ...prevValues,
                        [path + method]: JSON.stringify(
                            { error: "No response from server" },
                            null,
                            2
                        ), // 显示错误信息
                    }));
                } else {
                    // 发生请求设置时的错误
                    console.error(
                        "Error setting up the request:",
                        error.message
                    );
                    setOutputValues((prevValues) => ({
                        ...prevValues,
                        [path + method]: JSON.stringify(
                            { error: "Request setup error" },
                            null,
                            2
                        ), // 显示错误信息
                    }));
                }
            })
            .finally(() => {
                setInputValues((prevValues) => ({
                    ...prevValues,
                    [path]: {
                        ...prevValues[path],
                        loading: false, // 请求完成后重置loading状态
                    },
                }));
            });
        // .finally(() => setLoading(false)); // 请求完成后重置 loading 状态
    };

    if (!swaggerData) {
        return <div>Loading...</div>;
    }

    const renderInputField = (path, key, property) => {
        // console.log("path :", path);
        // console.log("key :", key);
        // console.log("property :", property);

        const defaultValue =
            property.default !== undefined ? property.default : "";
        const value =
            inputValues[path] && inputValues[path][key] !== undefined
                ? inputValues[path][key]
                : defaultValue;
        if (property.type === "array" && property.items) {
            return (
                <div>
                    {renderArrayInputField(path, key)}
                    <button onClick={() => addArrayItem(path, key)}>
                        Add Item
                    </button>
                </div>
            );
        }

        if (property.enum) {
            const initialValue = value || property.enum[0];
            if (!value) {
                handleInputChange(path, key, initialValue);
            }
            // console.log("property.validate :", property.validate);
            if (property.type === "boolean") {
                const filteredOptions = property.enum.filter(
                    (option) => option === true || option === false
                );

                return (
                    <select
                        value={value}
                        onChange={(e) =>
                            handleInputChange(path, key, e.target.value)
                        }
                    >
                        {filteredOptions.map((option) => (
                            <option key={option} value={option}>
                                {option == true ? "true" : "false"}
                            </option>
                        ))}
                    </select>
                );
            } else {
                return (
                    <select
                        value={value}
                        onChange={(e) =>
                            handleInputChange(path, key, e.target.value)
                        }
                    >
                        {property.enum.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );
            }
        } else {
            if (!property.readOnly) {
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                            handleInputChange(path, key, e.target.value)
                        }
                    />
                );
            } else {
                return (
                    <input
                        type="text"
                        value={value}
                        disabled
                        onChange={(e) =>
                            handleInputChange(path, key, e.target.value)
                        }
                    />
                );
            }
        }
    };

    return (
        <div>
            <h1>Swagger UI Generator</h1>
            <Flex wrap gap="small">
                {Object.entries(swaggerData.paths).map(([path, methods]) =>
                    Object.entries(methods).map(([method, details]) => (
                        <div
                            key={`${path}_${method}`}
                            style={{
                                marginBottom: "20px",
                                border: "1px solid #ddd",
                                padding: "10px",
                            }}
                        >
                            <h2>
                                {swaggerData.paths[path][method].tags + " "}
                                <span style={{ color: "red" }}>{method}</span>
                            </h2>
                            {details.parameters.map((param) => {
                                if (param.in === "body") {
                                    const schema =
                                        swaggerData.definitions[
                                            param.schema.$ref.split("/").pop()
                                        ];

                                    return Object.keys(schema.properties).map(
                                        (key) => {
                                            const property =
                                                schema.properties[key];
                                            if (property.dump_only) return null;
                                            return (
                                                <div
                                                    key={key}
                                                    style={{
                                                        marginBottom: "10px",
                                                    }}
                                                >
                                                    <label
                                                        style={{
                                                            marginRight: "10px",
                                                        }}
                                                    >
                                                        {key}:
                                                    </label>
                                                    {renderInputField(
                                                        path,
                                                        key,
                                                        property
                                                    )}
                                                </div>
                                            );
                                        }
                                    );
                                } else {
                                    return (
                                        <div
                                            key={param.name}
                                            style={{ marginBottom: "10px" }}
                                        >
                                            <label
                                                style={{ marginRight: "10px" }}
                                            >
                                                {param.name}:
                                            </label>
                                            <input
                                                type="text"
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        path,
                                                        param.name,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    );
                                }
                            })}
                            <button
                                onClick={() => handleSubmit(path, method)}
                                disabled={
                                    inputValues[path] &&
                                    inputValues[path].loading
                                }
                                style={{ marginBottom: "10px" }}
                            >
                                {inputValues[path] && inputValues[path].loading
                                    ? "Loading..."
                                    : "Submit"}
                            </button>
                            {/* <button
    onClick={() => handleSubmit(path, method)}
    disabled={loading} // 禁用按钮
    style={{ marginBottom: "10px" }}
>
    {loading ? "Loading..." : "Submit"}
</button> */}
                            {/* {outputValues[path + method] && ( */}
                            <div
                                style={{
                                    border: "1px solid #ddd",
                                    padding: "10px",
                                    height: "20rem",
                                    width: "23rem",
                                    textAlign: "left",
                                    overflowY: "auto", // 添加垂直滚动条
                                }}
                            >
                                <pre>{outputValues[path + method]}</pre>
                            </div>
                            {/* )} */}
                        </div>
                    ))
                )}
            </Flex>
            {/* <div className="formValue">
                <Row gutter={4} justify="center">
                    <Col span={12}>
                        <Card
                            style={{
                                width: 300,
                            }}
                        >
                            温度 {temperature}
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card
                            style={{
                                width: 300,
                            }}
                        >
                            真空值 {vacuumValue}
                        </Card>
                    </Col>
                </Row>
                <Row gutter={4} justify="center" style={{ marginTop: 16 }}>
                    <Card>
                        <Col span={24}>
                            低温循环
                            <div style={{ marginBottom: "16px" }} />
                            <Steps
                                progressDot={customDot}
                                current={currentStep === -1 ? 0 : currentStep}
                            >
                                {progressPoints.map((point, index) => (
                                    <Step
                                        key={index}
                                        title={`温度： ${point}`}
                                        // description={`Point ${point}°C`}
                                    />
                                ))}
                            </Steps>
                        </Col>
                    </Card>
                </Row>
            </div> */}
        </div>
    );
};

export default App;
