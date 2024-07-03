import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import colors from "@components/color/index";
import { Modal, Input, TimePicker, Button, InputNumber } from "antd";
import dayjs from "dayjs";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import "./line.css";
import KeyboardNumber from "@components/keyboard/number/index.js";

let fillAreaDatas = [];
let fillAreaData = [];
let dataDynamic = [
    // { time: 0, value: 20 },
    // { time: 1, value: 20 },
    // { time: 3, value: 20 },
    // { time: 4, value: 71 },
    // { time: 5, value: 71 },
    // { time: 7, value: 71 },
    // { time: 8, value: 71 },
    // { time: 9, value: 71 },
];
let data = [];
let num = [];
// let linePointChange = [];
let linePoint = [];
let selected = [];
let now;
let endTime;
let lineFlag;
const _ = require("lodash");

now = new Date();
now.setHours(0, 0, 1);
endTime = new Date(now.getTime() + 5 * 60 * 1000);

// let now = new Date();
// now.setHours(1, 0, 0);
// const endTime = new Date(now.getTime() + 5 * 60 * 1000);

const renderCurve = (svg, width, height, margin) => {
    // console.log("data", data);
    //data{time: '17:46:47', value: 81.41712213857508}

    const parsedData = data?.map((d) => ({
        ...d,
        time: parseTime(d.time),
    }));

    // if (data.length > 0) {
    //     const timeString = data[0].time;
    //     // now = new Date(timeString);
    //     now = new Date();
    //     const [hours, minutes, seconds] = timeString.split(":").map(Number);
    //     console.log("hours", hours);
    //     console.log("minutsecondses", seconds);

    //     now.setHours(hours, minutes, seconds);
    // } else {
    //     now = new Date();
    // }
    // console.log("parse", parsedData);
    //洗脱液的曲线图
    const xScale = d3.scaleTime().domain([now, endTime]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    const xAxis = d3.axisTop(xScale);
    const yAxis = d3
        .axisRight(yScale)
        .tickFormat((d) => (d === 0 || d === 100 ? "" : d));
    svg.append("g")
        .attr("transform", `translate(0, ${height - 1})`)
        .style("color", "red")
        .call(xAxis);
    svg.append("g")
        .attr("transform", `translate(0, 0)`)
        .style("color", "red")
        .call(yAxis);
    const line = d3
        .line()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.value))
        .curve(d3.curveBasis);
    // console.log("par", parsedData);
    svg.append("path")
        .datum(parsedData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line);
    // const lineX = d3
    //     .line()
    //     .x((d) => xScale(d.time))
    //     .y(height)
    //     .curve(d3.curveLinear);

    // svg.append("path")
    //     .datum(data)
    //     .attr("fill", "none")
    //     .attr("stroke", "red")
    //     .attr("stroke-width", 2)
    //     .attr("d", lineX);
    renderVertical(svg, xScale, height);
    renderArea(svg, xScale, yScale, height);
};

const renderVertical = (svg, xScale, height) => {
    const parsedData = num?.map((d) => ({
        ...d,
        timeStart: parseTime(d.timeStart),
        timeEnd: parseTime(d.timeEnd),
    }));
    // 生成垂直虚线的路径生成器
    const lineVertical = (d) => {
        return `M${xScale(d.timeEnd)},${height}V${0}`;
    };
    // 绘制垂直虚线
    svg.selectAll(".vertical-line")
        .data(parsedData)
        .enter()
        .append("path")
        .attr("class", "vertical-line")
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,5") // 设置虚线样式
        .attr("d", lineVertical);
    // //生成flag
    svg.selectAll(".flag-text")
        .data(parsedData)
        .enter()
        .append("text")
        .attr("class", "flag-text")
        .attr(
            "x",
            (d) =>
                (xScale(d.timeEnd) - xScale(d.timeStart)) / 2 +
                xScale(d.timeStart)
        )
        .attr("y", 30) // 计算中间位置的 y 坐标
        .attr("text-anchor", "middle")
        .text((d) => d.tube);
};

const renderArea = (svg, xScale, yScale, height) => {
    // 生成填充区域的路径生成器
    const area = d3
        .area()
        .x((d) => xScale(d.time))
        .y0(height)
        .y1((d) => yScale(d.value))
        .curve(d3.curveLinear);

    const getXandY = (tube) => {
        const selectedTube = num.find((item) => item.tube === tube);
        console.log("selectedTube---------- :", selectedTube);

        if (selectedTube) {
            return {
                x1: selectedTube.timeStart,
                x2: selectedTube.timeEnd,
                color: selectedTube.color,
            };
        } else {
            return null; // 如果未找到匹配的 tube，则返回 null 或者其他你认为合适的值
        }
    };
    selected.forEach((selectTube) => {
        console.log("selectTube", selectTube["tube_list"]);
        let fillColor = "";
        selectTube["tube_list"].forEach((tube) => {
            const xy = getXandY(tube);
            console.log("xy", xy);
            if (xy) {
                const { x1, x2, color } = xy;
                console.log("x1, x2, color :", x1, x2, color);
                fillColor = color;
                let fillArea = data.filter((item) => {
                    return item.time >= x1 && item.time <= x2;
                });
                fillAreaData = [...fillAreaData, ...fillArea];
            }
        });
        const { x1, x2, color } = selectTube["tube_list"][0]
            ? getXandY(selectTube["tube_list"][0])
            : "";
        fillAreaData.unshift({ time: x1, value: fillAreaData[0].value });
        // const { x1, x2, color } = getXandY(
        //     selectTube["tube_list"][selectTube["tube_list"].length - 1]
        // );

        // fillAreaData.unshift({
        //     time: x1,
        //     value: fillAreaData[fillAreaData.length - 1].value,
        // });
        fillAreaData = fillAreaData.sort((a, b) => a.time - b.time);
        console.log("fillAreaData :", fillAreaData);
        let fill = { area: fillAreaData, color: fillColor };
        fillAreaDatas = [...fillAreaDatas, fill];
        fillAreaData = [];
    });

    console.log("fillAreaDatas :", fillAreaDatas);
    fillAreaDatas.forEach((fill) => {
        console.log("fill :", fill);
        const parsedData = fill.area?.map((d) => ({
            ...d,
            time: parseTime(d.time),
        }));

        if (fill.color) {
            const colorName = `color${fill.color}`;
            svg.append("path")
                .datum(parsedData)
                .attr("fill", colors[colorName].backgroundColor)
                .attr("stroke", "none")
                .attr("d", area);
        }
    });
    fillAreaDatas = [];
    // 绘制填充区域
};
const parseTime = (timeString) => {
    // 解析时间字符串
    // console.log("timeString", timeString);
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const parsedTime = new Date();
    parsedTime.setHours(hours, minutes, seconds, 0);
    // console.log("endTime", endTime);
    // console.log("startTime", startTime);
    // 计算相对于起始时间的差值（毫秒）
    // const timeDifference = parsedTime.getTime() - startTime.getTime();
    // console.log("timeDiff", timeDifference);
    // 计算映射到横坐标的值
    // const totalDuration = endTime.getTime() - startTime.getTime();
    // const xCoordinate = (timeDifference / totalDuration) * 100; // 比如映射到0-100的范围内
    // console.log("timeDiff", totalDuration);

    return parsedTime;
};
const parseTimeString = (time) => {
    const date = new Date(time);

    const parseTimeString = date.toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // 使用 24 小时制
    });
    return parseTimeString;
};
const renderLine = (
    width,
    height,
    margin,
    svg,
    svgRef,
    setSelectedPoint,
    setInputValues,
    setIsModalVisible,
    linePointChange,
    setlinePointChange
) => {
    console.log("linePointChange :", linePointChange);
    const parsedData = linePointChange?.map((d) => ({
        ...d,
        time: parseTime(d.time),
    }));
    //洗脱液的折线图
    // 定义拖拽行为
    const drag = d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

    let delD = [];
    let newD = [];
    let ifMove = [];

    const x2Scale = d3.scaleLinear().domain([now, endTime]).range([0, width]);
    const y2Scale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    const x2Axis = d3.axisTop(x2Scale);
    const y2Axis = d3
        .axisLeft(y2Scale)
        .tickFormat((d) => (d === 0 || d === 100 ? "" : d));
    const yAxisG = svg
        .append("g")
        .attr("transform", `translate(${margin.right - 1}, 0)`)
        .style("color", "blue")
        .call(y2Axis);
    yAxisG
        .selectAll(".tick text")
        .attr("x", -10) // 将文本标签向左移动 10 像素
        .attr("y", 0) // 将文本标签向左移动 10 像素
        .style("text-anchor", "end"); // 右对齐文本

    svg.selectAll("circle")
        .data(parsedData)
        .enter()
        .append("circle")
        .attr("cx", (d) => x2Scale(d.time))
        .attr("cy", (d) => y2Scale(d.value))
        .attr("r", 7) // 设置圆点半径
        .attr("fill", "blue")
        .on("mouseover", function (event, d) {
            d3.select(this).style("opacity", 1); // 鼠标移入时显示圆点
            const [time, value] = d3.pointer(event, svgRef.current);
            // 获取鼠标位置
            svg.append("text")
                .attr("class", "coordinate-text")
                .attr("x", time + 10)
                .attr("y", value - 10)
                .text(`(${d.time}, ${d.value})`)
                .attr("font-size", "12px")
                .attr("fill", "black")
                .attr("pointer-events", "none"); // 防止文字影响鼠标事件
        })
        .on("mouseout", function () {
            svg.selectAll(".coordinate-text").remove(); // 移除显示的坐标信息
        })
        .on("click", function (event, d) {
            handleClick(event, d);
        })
        .on("mousedown", prepareDrag)
        .call(drag); // 应用拖拽行为
    const handleClick = (event, d) => {
        console.log("lineFlag", lineFlag);
        if (lineFlag == 1) {
            setSelectedPoint({
                time: parseTimeString(d.time),
                value: d.value,
            });
            setInputValues({ time: d.time, value: d.value });
            setIsModalVisible(true);
        }
    };
    // 折线生成器
    const line2 = d3
        .line()
        .x((d) => x2Scale(d.time))
        .y((d) => y2Scale(d.value))
        .curve(d3.curveLinear); // 使用 Cardinal 曲线插值
    console.log("parsedData", parsedData);
    // 绘制折线路径
    svg.append("path")
        .datum(parsedData)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", line2);
    const dragThreshold = 300; // 拖拽启动阈值，单位为像素
    let startX, startY;
    let isDragging = false;
    let dragTimeout;

    // 拖拽开始前的准备
    function prepareDrag(event, d) {
        startX = event.x;
        startY = event.y;
    }
    // 拖拽开始时的处理函数
    function dragstarted(event, d) {
        d3.select(this).raise().classed("active", true);
        delD = { time: parseTimeString(d.time), value: d.value };
        ifMove = [d.time, d.value];
    }

    // 拖拽过程中的处理函数
    function dragged(event, d) {
        const dx = event.x - startX;
        console.log("dx :", dx);
        const dy = event.y - startY;
        console.log("dy :", dy);
        const distance = Math.sqrt(dx * dx + dy * dy);
        console.log("distance :", distance);

        if (distance > dragThreshold) {
            console.log("dragged :");
            isDragging = true;

            d3.select(this)
                .attr("cx", (d.time = event.x))
                .attr("cy", (d.value = event.y));
            let newLinePoint = linePointChange;
            newLinePoint = newLinePoint.filter((point) => {
                return !_.isEqual(delD, point);
            });
            setlinePointChange(newLinePoint);
            console.log("setlinePointChange :", newLinePoint);
        } else {
            d3.select(this).raise().classed("active", false);
        }
    }

    // 拖拽结束时的处理函数
    function dragended(event, d) {
        // dragTimeout = setTimeout(() => {
        //     if (!isDragging) {
        //     }
        //     isDragging = false;
        // }, 100);
        //判断是否是拖拽行为
        if (isDragging) {
            console.log("isDragging :", isDragging);

            var date = new Date(x2Scale.invert(d.time));
            d3.select(this).classed("active", false);
            newD = {
                time: parseTimeString(date),
                value: y2Scale.invert(d.value),
            };
            if (!_.isEqual(newD, delD)) {
                let newLinePoint = linePointChange.filter((point) => {
                    return !_.isEqual(delD, point);
                });
                newLinePoint.push(newD);
                newLinePoint = newLinePoint.sort(
                    (a, b) => parseTime(a.time) - parseTime(b.time)
                );
                setlinePointChange(newLinePoint);
                console.log("linePointChange :", linePointChange);
            }
        } else {
            console.log("isDragging :", isDragging);

            handleClick(event, d);
        }
    }
};

const handleReceiveFlags = (inputNumber) => {
    // inputNumber
    console.log("inputNumber :", inputNumber);
};
const LineChart = (props) => {
    const svgRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [inputValues, setInputValues] = useState({ time: "", value: "" });
    const [linePointChange, setlinePointChange] = useState([]);

    data = props.data;
    // console.log("data.props", props.data);
    num = props.num;
    linePoint = props.linePoint;
    console.log("props :", props);
    lineFlag = props.lineFlag;
    // if (linePointChange.length == 0) {
    //     setlinePointChange(linePoint);
    // }
    selected = props.selected_tubes;
    // 在组件挂载时设置linePointChange的初始值
    useEffect(() => {
        if (linePointChange.length === 0) {
            setlinePointChange(linePoint);
        }
    }, [linePointChange, linePoint]); // 依赖项数组包含需要触发effect的变量

    useEffect(() => {
        const headerDiv = document.querySelector(".headerStyle");
        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });
        resizeObserver.observe(headerDiv);
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!data || dimensions.width === 0 || dimensions.height === 0) return;
        d3.select(svgRef.current).selectAll("*").remove();

        // 数据
        const svg = d3.select(svgRef.current);
        console.log(
            "-------------------------------bianle----------------------------------"
        );
        // SVG 宽度和高度
        const width = dimensions.width;
        const height = dimensions.height;
        const margin = { top: 20, right: width, bottom: 10, left: 0 };

        renderCurve(svg, width, height, margin, num, selected);
        renderLine(
            width,
            height,
            margin,
            svg,
            svgRef,
            setSelectedPoint,
            setInputValues,
            setIsModalVisible,
            linePointChange,
            setlinePointChange
        );
    }, [data, dimensions, num, selected, linePoint, linePointChange]);
    const handleOk = () => {
        const newX = parseTimeString(inputValues.time);
        // console.log("newX :", newX);

        const newY = inputValues.value;
        let newData = linePointChange.map((point) =>
            _.isEqual(selectedPoint, point)
                ? { time: newX, value: newY }
                : point
        );
        newData = newData.sort((a, b) => parseTime(a.time) - parseTime(b.time));
        setlinePointChange(newData);

        // console.log("linePoint----------- :", linePoint);
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleInputChange = (e) => {
        let time = e.$d ? e.$d : inputValues.time;
        let value = e.$d ? inputValues.value : e;
        setInputValues({ time: time, value: value });
    };

    return (
        <div
            className="headerStyle"
            style={{
                width: "100%",
                height: "300px",
                border: "none",
                position: "relative",
                top: "0px",
            }}
        >
            <svg ref={svgRef} width="100%" height="100%"></svg>
            <Modal
                title="Edit Point"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                {/* <Input
                    name="time"
                    value={inputValues.time}
                    onChange={handleInputChange}
                    placeholder="time"
                /> */}
                <TimePicker
                    value={dayjs(parseTimeString(inputValues.time), "HH:mm:ss")}
                    onChange={handleInputChange}
                />
                {/* <Input
                    name="value"
                    value={inputValues.value}
                    onChange={handleInputChange}
                    placeholder="value"
                /> */}
                <InputNumber
                    className="input-number"
                    value={inputValues.value}
                    min={0}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value?.replace("%", "")}
                    onChange={handleInputChange}
                    controls={{
                        upIcon: <PlusOutlined />,
                        downIcon: <MinusOutlined />,
                    }}
                />
                <KeyboardNumber callback={handleReceiveFlags}></KeyboardNumber>
            </Modal>
        </div>
    );
};
export default LineChart;
