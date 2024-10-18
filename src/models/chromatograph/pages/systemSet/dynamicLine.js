import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Input, Button } from "antd";
import * as d3 from "d3";
import "./dynamicLine.css";

const GradientCurveSettings = () => {
    const [points, setPoints] = useState([
        { time: 0, pumpB: 20, flowRate: 100 },
        { time: 10, pumpB: 50, flowRate: 100 },
        { time: 20, pumpB: 80, flowRate: 100 },
    ]);
    const [currentPoint, setCurrentPoint] = useState({
        time: "",
        pumpB: "",
        flowRate: "",
    });
    const [dimensions, setDimensions] = useState({ width: 500, height: 300 });
    const [isDragging, setIsDragging] = useState(false);
    const [draggedPoint, setDraggedPoint] = useState(null);
    const svgRef = useRef(null);
    const dragTimerRef = useRef(null);
    let addFlag = 0; //0表示还未清空，1表示已清空

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
            .y((d) => y(d.pumpB));

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
            .attr("cy", (d) => y(d.pumpB))
            .attr("r", 8)
            .attr("fill", (d) =>
                draggedPoint &&
                draggedPoint.time === d.time &&
                draggedPoint.pumpB === d.pumpB
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
            const xScale = d3
                .scaleLinear()
                .domain([0, d3.max(points, (d) => d.time)])
                .range([0, dimensions.width - margin.left - margin.right]);

            const yScale = d3
                .scaleLinear()
                .domain([0, 100])
                .range([dimensions.height - margin.top - margin.bottom, 0]);

            const newTime = Math.round(xScale.invert(x - margin.left));
            const newPumpB = Math.round(yScale.invert(y - margin.top));

            const updatedPoints = points.map((p) =>
                p === currentPoint
                    ? { ...p, time: newTime, pumpB: newPumpB }
                    : p
            );
            const sortedPoints = updatedPoints.sort((a, b) => a.time - b.time);

            setPoints(sortedPoints);
            setCurrentPoint({
                time: newTime,
                pumpB: newPumpB,
                flowRate: currentPoint.flowRate,
            });
            setDraggedPoint({
                time: newTime,
                pumpB: newPumpB,
                flowRate: currentPoint.flowRate,
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
            setCurrentPoint({ time: "", pumpB: "", flowRate: "" });
            addFlag = 1;
        } else if (addFlag == 1 || isAllEmpty) {
            if (
                currentPoint.time &&
                currentPoint.pumpB &&
                currentPoint.flowRate
            ) {
                const newPoint = {
                    time: parseInt(currentPoint.time),
                    pumpB: parseInt(currentPoint.pumpB),
                    flowRate: parseInt(currentPoint.flowRate),
                };
                setPoints(
                    [...points, newPoint].sort((a, b) => a.time - b.time)
                );

                setCurrentPoint({ time: "", pumpB: "", flowRate: "" });
            }
            addFlag = 0;
        }
    };

    const handleDeletePoint = () => {
        if (currentPoint.time) {
            setPoints(
                points.filter((p) => p.time !== parseInt(currentPoint.time))
            );
            setCurrentPoint({ time: "", pumpB: "", flowRate: "" });
        }
    };

    return (
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
            <Col span={4}>
                <Input
                    style={{ marginTop: "2.5rem" }}
                    placeholder="时间"
                    name="time"
                    value={currentPoint.time}
                    onChange={handleInputChange}
                />
                <Input
                    placeholder="泵B速度"
                    name="pumpB"
                    value={currentPoint.pumpB}
                    onChange={handleInputChange}
                    style={{ marginTop: "1rem" }}
                />
                <Input
                    placeholder="总流速"
                    name="flowRate"
                    value={currentPoint.flowRate}
                    onChange={handleInputChange}
                    style={{ marginTop: "1rem" }}
                />
                <Button onClick={handleAddPoint} style={{ marginTop: "1rem" }}>
                    添加
                </Button>
                <Button
                    onClick={handleDeletePoint}
                    style={{ marginTop: "1rem" }}
                >
                    删除
                </Button>
            </Col>
        </Row>
    );
};

export default GradientCurveSettings;
