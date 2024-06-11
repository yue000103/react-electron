import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Flex } from "antd";

const App = () => {
    const [swaggerData, setSwaggerData] = useState(null);
    const [inputValues, setInputValues] = useState({});
    const [outputValues, setOutputValues] = useState({});

    useEffect(() => {
        // 使用你的Swagger JSON文件的URL
        const swaggerUrl = "http://127.0.0.1:5000/swagger-json/";

        axios
            .get(swaggerUrl)
            .then((response) => {
                console.log("response:", response);
                setSwaggerData(response.data);
            })
            .catch((error) =>
                console.error("Error fetching Swagger data:", error)
            );
    }, []);

    const handleInputChange = (path, paramName, value) => {
        console.log("paramName :", paramName);

        setInputValues((prevValues) => ({
            ...prevValues,
            [path]: {
                ...prevValues[path],
                [paramName]: value,
            },
        }));
    };

    const handleSubmit = (path, method) => {
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

        const config = {
            method: method,
            url: `http://127.0.0.1:5000${path}`,
            params: method === "get" ? params : {},
            headers:
                method !== "get" ? { "Content-Type": "application/json" } : {},
        };

        if (method !== "get") {
            config.data = params;
        }

        axios(config)
            .then((response) => {
                setOutputValues((prevValues) => ({
                    ...prevValues,
                    [path + method]: JSON.stringify(response.data, null, 2),
                }));
            })
            .catch((error) =>
                console.error("Error making API request:", error)
            );
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
        if (property.enum) {
            console.log("property.validate :", property.validate);
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
                            key={path}
                            style={{
                                marginBottom: "20px",
                                border: "1px solid #ddd",
                                padding: "10px",
                            }}
                        >
                            <h2>{swaggerData.paths[path][method].tags}</h2>
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
                                style={{ marginBottom: "10px" }}
                            >
                                Submit
                            </button>
                            {/* {outputValues[path + method] && ( */}
                            <div
                                style={{
                                    border: "1px solid #ddd",
                                    padding: "10px",
                                    height: "100rem",
                                    width: "25rem",
                                    textAlign: "left",
                                }}
                            >
                                <pre>{outputValues[path + method]}</pre>
                            </div>
                            {/* )} */}
                        </div>
                    ))
                )}
            </Flex>
        </div>
    );
};

export default App;
