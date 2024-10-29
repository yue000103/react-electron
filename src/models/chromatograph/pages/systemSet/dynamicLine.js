import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Input, Button } from "antd";
import * as d3 from "d3";
import "./dynamicLine.css";
import { getEluentLine, updateEluentLine } from "../../api/eluent_curve";
import useIndexedDB from "../../hooks/useIndexedDB";

const convertTimeToMinutes = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return hours * 60 + minutes + seconds / 60; // Convert to minutes
};

const convertTimeToString = (minutes) => {
    const hours = Math.floor(minutes / 60)
        .toString()
        .padStart(2, "0");
    const mins = Math.floor(minutes % 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.round((minutes % 1) * 60)
        .toString()
        .padStart(2, "0");

    return `${hours}:${mins}:${seconds}`;
};

const GradientCurveSettings = () => {
    const [methodId, setMethodId] = useState(0); // 使用 state 管理 methodId
    const { data, loading, error } = useIndexedDB(methodId); // 使用 Hook
    const [points, setPoints] = useState([
        // { time: 0, pumpB: 20, flowRate: 100 },
        // { time: 10, pumpB: 50, flowRate: 100 },
        // { time: 20, pumpB: 80, flowRate: 100 },
    ]);
    const [currentPoint, setCurrentPoint] = useState({
        time: "",
        value: "",
        flow_rate: "",
    });
    const [dimensions, setDimensions] = useState({ width: 500, height: 300 });
    const [isDragging, setIsDragging] = useState(false);
    const [draggedPoint, setDraggedPoint] = useState(null);
    const svgRef = useRef(null);
    const dragTimerRef = useRef(null);
    let addFlag = 0; //0表示还未清空，1表示已清空

    useEffect(() => {
        // 从 localStorage 获取 methodId
        const storedMethodId = Number(localStorage.getItem("methodId")); // 转换为数字
        if (storedMethodId) {
            setMethodId(storedMethodId); // 更新 state
        }
    }, []); // 只在组件挂载时运行

    useEffect(() => {
        getEluentLine().then((responseData) => {
            if (!responseData.error) {
                const updatedPoints = responseData.data.point?.map((p) => ({
                    ...p,
                    time: convertTimeToMinutes(p.time), // 转换时间为分钟
                }));
                setPoints((prevNum) => updatedPoints);
            }
        });
    }, []);

    useEffect(() => {
        drawChart();
        return () => {
            if (dragTimerRef.current) {
                clearTimeout(dragTimerRef.current);
            }
        };
    }, [points, dimensions, draggedPoint]);

    const drawChart = () => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        const x = d3
            .scaleLinear()
            .domain([0, d3.max(points, (d) => d.time)])
            .range([0, width]);

        const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // 添加x轴
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // 添加y轴
        g.append("g").call(d3.axisLeft(y));

        // 添加网格线
        const xGrid = d3
            .axisBottom(x)
            .tickSize(-height)
            .tickFormat("")
            .ticks(10);

        const yGrid = d3.axisLeft(y).tickSize(-width).tickFormat("").ticks(10);

        svg.append("g")
            .attr("class", "x grid")
            .attr(
                "transform",
                `translate(${margin.left},${height + margin.top})`
            )
            .call(xGrid);

        svg.append("g")
            .attr("class", "y grid")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .call(yGrid);

        // 绘制线条
        const line = d3
            .line()
            .x((d) => x(d.time))
            .y((d) => y(d.value));

        g.append("path")
            .datum(points)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        // 绘制点
        g.selectAll(".point")
            .data(points)
            .enter()
            .append("circle")
            .attr("class", "point")
            .attr("cx", (d) => x(d.time))
            .attr("cy", (d) => y(d.value))
            .attr("r", 8)
            .attr("fill", (d) =>
                draggedPoint &&
                draggedPoint.time === d.time &&
                draggedPoint.value === d.value
                    ? "red"
                    : "steelblue"
            )
            // .on("click", handleClick)
            // .on("mousemove", handleMouseout)
            .on("mousedown", handleMouseDown)
            .on("dblclick", handleDblclick)

            .on("mouseup", handleMouseUp)
            .call(d3.drag().on("drag", handleDrag));
    };

    const handleClick = (event, d) => {
        console.log("1016-2  d", d);
    };

    const handleDblclick = (event, d) => {
        setCurrentPoint(d);

        setIsDragging(true);
        setDraggedPoint(d);
    };

    const handleMouseDown = (event, d) => {
        setCurrentPoint(d);
        console.log("1016-2  d", d);
    };

    const handleMouseUp = (event, d) => {
        console.log("1016-2  handleMouseUp", d);

        // if (dragTimerRef.current) {
        //     clearTimeout(dragTimerRef.current);
        // }
        // if (!isDragging) {
        //     // 视为点击
        //     setCurrentPoint(currentPoint);
        // } else {
        //     setIsDragging(false);
        //     setDraggedPoint(null);
        // }
    };

    const handleDrag = (event) => {
        if (isDragging) {
            const svgNode = svgRef.current;
            const svgRect = svgNode.getBoundingClientRect();
            const x = event.sourceEvent.clientX - svgRect.left;
            const y = event.sourceEvent.clientY - svgRect.top;

            const margin = { top: 20, right: 20, bottom: 30, left: 40 };
            const maxTime = d3.max(points, (d) => d.time);

            const xScale = d3
                .scaleLinear()
                .domain([0, d3.max(points, (d) => d.time)])
                .range([0, dimensions.width - margin.left - margin.right]);

            const yScale = d3
                .scaleLinear()
                .domain([0, 100])
                .range([dimensions.height - margin.top - margin.bottom, 0]);
            console.log("1023  data.samplingTime", data.samplingTime);

            // 计算新的时间值并仅确保不超过最大时间且不小于0
            let newTime = Math.round(xScale.invert(x - margin.left));
            newTime = Math.max(0, Math.min(newTime, data.samplingTime));
            const newPumpB = Math.max(
                0,
                Math.min(100, Math.round(yScale.invert(y - margin.top)))
            );

            const updatedPoints = points.map((p) =>
                p === currentPoint
                    ? { ...p, time: newTime, value: newPumpB }
                    : p
            );
            const sortedPoints = updatedPoints.sort((a, b) => a.time - b.time);

            setPoints(sortedPoints);
            setCurrentPoint({
                time: newTime,
                value: newPumpB,
                flow_rate: currentPoint.flow_rate,
            });
            setDraggedPoint({
                time: newTime,
                value: newPumpB,
                flow_rate: currentPoint.flow_rate,
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPoints(
            (prevPoints) =>
                prevPoints.filter((p) => p.time !== currentPoint.time) // 假设通过 time 唯一标识点
        );

        console.log("1016-2 :e.target", e.target);
        console.log("1016-2 :name", name);
        console.log("1016-2 :value", value);
        setCurrentPoint((prev) => {
            const updatedPoint = { ...prev, [name]: value };
            // 3. 将 updatedPoint 添加到 points 中
            setPoints((prevPoints) =>
                [...prevPoints, updatedPoint].sort((a, b) => a.time - b.time)
            );

            return updatedPoint; // 返回更新后的 currentPoint
        });
        console.log("1016-2  currentPoint :", currentPoint);
    };

    const handleAddPoint = () => {
        const isAllEmpty = Object.values(currentPoint).every(
            (value) => value === ""
        );

        if (addFlag == 0) {
            setCurrentPoint({ time: "", value: "", flow_rate: "" });
            addFlag = 1;
        } else if (addFlag == 1 || isAllEmpty) {
            if (
                currentPoint.time &&
                currentPoint.value &&
                currentPoint.flow_rate
            ) {
                const newPoint = {
                    time: parseInt(currentPoint.time),
                    value: parseInt(currentPoint.value),
                    flow_rate: parseInt(currentPoint.flow_rate),
                };
                setPoints(
                    [...points, newPoint].sort((a, b) => a.time - b.time)
                );

                setCurrentPoint({ time: "", value: "", flow_rate: "" });
            }
            addFlag = 0;
        }
    };

    const handleDeletePoint = () => {
        if (currentPoint.time) {
            setPoints(
                points.filter((p) => p.time !== parseInt(currentPoint.time))
            );
            setCurrentPoint({ time: "", value: "", flow_rate: "" });
        }
    };

    const uploadPoint = () => {
        const updatedData = points.map((item) => ({
            ...item,
            time: convertTimeToString(item.time), // 转换时间为 "HH:mm:ss" 格式
        }));
        console.log("1023   uploadPoint", points);
        updateEluentLine({
            point: Object.values(updatedData),
            start_time: "",
        }).then((responseData) => {
            if (!responseData.error) {
            }
        });
    };

    return (
        <div className="contain">
            <Row>
                <Col span={19}>
                    <svg
                        ref={svgRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        onMouseLeave={() => {
                            if (dragTimerRef.current) {
                                clearTimeout(dragTimerRef.current);
                            }
                            setIsDragging(false);
                            setDraggedPoint(null);
                        }}
                    ></svg>
                </Col>
                <Col span={5}>
                    <Row align="middle" style={{ marginTop: "0rem" }}>
                        <Col span={24}>
                            <label>时间：</label>
                        </Col>
                        <Col span={24}>
                            <Input
                                placeholder="时间"
                                name="time"
                                value={currentPoint.time}
                                onChange={handleInputChange}
                            />
                        </Col>
                    </Row>
                    <Row align="middle" style={{ marginTop: "1rem" }}>
                        <Col span={24}>
                            <label>泵B速度：</label>
                        </Col>
                        <Col span={24}>
                            <Input
                                placeholder="泵B速度"
                                name="value"
                                value={currentPoint.value}
                                onChange={handleInputChange}
                            />
                        </Col>
                    </Row>
                    <Row align="middle" style={{ marginTop: "1rem" }}>
                        <Col span={12}>
                            <label>总流速：</label>
                        </Col>
                        <Col span={24}>
                            <Input
                                placeholder="总流速"
                                name="flow_rate"
                                value={currentPoint.flow_rate}
                                onChange={handleInputChange}
                            />
                        </Col>
                    </Row>
                    <Row align="middle">
                        <Button
                            onClick={handleAddPoint}
                            style={{
                                marginTop: "1rem",
                                marginLeft: "0rem",
                                width: "100%",
                                backgroundColor: "#1890ff", // 蓝色背景
                                color: "#ffffff", // 白色字体
                                borderColor: "#1890ff", // 蓝色边框
                            }}
                        >
                            添加
                        </Button>
                    </Row>
                    <Row align="middle">
                        <Button
                            onClick={handleDeletePoint}
                            style={{
                                marginTop: "1rem",
                                marginLeft: "0rem",
                                width: "100%",
                                backgroundColor: "#ff4d4f", // 红色背景
                                color: "#ffffff", // 白色字体
                                borderColor: "#ff4d4f", // 红色边框
                            }}
                        >
                            删除
                        </Button>
                    </Row>
                </Col>
            </Row>
            <Button
                type="primary"
                style={{ marginBottom: "1rem" }}
                onClick={uploadPoint}
            >
                上传
            </Button>
        </div>
    );
};

export default GradientCurveSettings;
