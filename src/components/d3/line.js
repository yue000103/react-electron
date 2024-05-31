import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import colors from "@components/color/index";
import { Modal, Input } from "antd";

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
let selected = [];

const renderCurve = (svg, width, height, margin) => {
    // console.log("data", data);
    //data{time: '17:46:47', value: 81.41712213857508}

    const parsedData = data?.map((d) => ({
        ...d,
        time: parseTime(d.time),
    }));
    let now;
    if (data.length > 0) {
        const timeString = data[0].time;
        // now = new Date(timeString);
        now = new Date();
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        now.setHours(hours, minutes, seconds);
    } else {
        now = new Date();
    }

    const endTime = new Date(now.getTime() + 5 * 60 * 1000);
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
    // renderArea(svg, xScale, yScale, height);
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
        if (selectedTube) {
            return {
                x1: selectedTube.time,
                x2: selectedTube.value,
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
                fillColor = color;
                let yObject1 = data.find((item) => item.time === x1);
                fillAreaData = [...fillAreaData, yObject1];
                let yObject2 = data.find((item) => item.time === x2);
                fillAreaData = [...fillAreaData, yObject2];
            }
        });
        fillAreaData = fillAreaData.sort((a, b) => a.time - b.time);
        let fill = { area: fillAreaData, color: fillColor };
        fillAreaDatas = [...fillAreaDatas, fill];
        fillAreaData = [];
    });
    for (let fill in fillAreaDatas) {
        console.log(fillAreaDatas[fill]["color"]);
        if (fillAreaDatas[fill]["color"]) {
            let colorName = `color${fillAreaDatas[fill]["color"]}`;
            svg.append("path")
                .datum(fillAreaDatas[fill]["area"])
                .attr("fill", colors[colorName].backgroundColor) // 设置填充颜色及透明度
                .attr("stroke", "none")
                .attr("d", area);
        }
    }
    fillAreaDatas = [];
    // 绘制填充区域
};

const parseTime = (timeString) => {
    // 如果 timeString 是字符串，则进行转换
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const now = new Date();
    now.setHours(hours, minutes, seconds);
    return now;
};
const renderLine = (
    width,
    height,
    margin,
    svg,
    svgRef,
    setSelectedPoint,
    setInputValues,
    setIsModalVisible
) => {
    //洗脱液的折线图
    const x2Scale = d3.scaleLinear().domain([0, 10]).range([0, width]);
    const y2Scale = d3.scaleLinear().domain([0, 50]).range([height, 0]);
    const x2Axis = d3.axisTop(x2Scale);
    const y2Axis = d3
        .axisLeft(y2Scale)
        .tickFormat((d) => (d === 0 || d === 50 ? "" : d));
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
        .data(dataDynamic)
        .enter()
        .append("circle")
        .attr("cx", (d) => x2Scale(d.time))
        .attr("cy", (d) => y2Scale(d.value))
        .attr("r", 5) // 设置圆点半径
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
            setSelectedPoint(d);
            setInputValues({ x: d.time, y: d.value });
            setIsModalVisible(true);
        });

    // 折线生成器
    const line2 = d3
        .line()
        .x((d) => x2Scale(d.time))
        .y((d) => y2Scale(d.value))
        .curve(d3.curveLinear); // 使用 Cardinal 曲线插值

    // 绘制折线路径
    svg.append("path")
        .datum(dataDynamic)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", line2);
};
const LineChart = (props) => {
    const svgRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [inputValues, setInputValues] = useState({ time: "", value: "" });

    data = props.data;
    // console.log("data.props", props.data);
    num = props.num;
    selected = props.selected_tubes;

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
        // console.log("data-------", data);
        if (!data || dimensions.width === 0 || dimensions.height === 0) return;
        d3.select(svgRef.current).selectAll("*").remove();

        // 数据
        const svg = d3.select(svgRef.current);

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
            setIsModalVisible
        );
    }, [data, dimensions, num]);
    const handleOk = () => {
        const newX = parseFloat(inputValues.time);
        const newY = parseFloat(inputValues.value);
        const newData = dataDynamic.map((point) =>
            point === selectedPoint ? { time: newX, value: newY } : point
        );
        dataDynamic = newData;
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
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
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Input
                    name="time"
                    value={inputValues.time}
                    onChange={handleInputChange}
                    placeholder="X coordinate"
                />
                <Input
                    name="value"
                    value={inputValues.value}
                    onChange={handleInputChange}
                    placeholder="Y coordinate"
                />
            </Modal>
        </div>
    );
};
export default LineChart;
