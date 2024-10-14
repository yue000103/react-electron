import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import colors from "@components/color/index";
import {
    Modal,
    Input,
    TimePicker,
    Button,
    InputNumber,
    Spin,
    Row,
    Col,
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import CustomScrollbar from "@components/scrollbar/customScrollbar.js";

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
let linePoint = [];
let selected = [];
let now;
let endTime;
const _ = require("lodash");

now = new Date();
now.setHours(0, 0, 0);


const renderCurve = (
    svg,
    height,
    samplingTime,
    xScale
) => {
    // console.log("data", data);
    //data{time: '17:46:47', value: 81.41712213857508}

    const parsedData = data?.map((d) => ({
        ...d,
        time: parseTime(d.time),
    }));
    console.log("0920   data--------------------", parsedData);
    const valueExtent = d3.extent(parsedData, (d) => d.value);
    const [minValue = -3, maxValue = 53] = valueExtent || [-3, 50]; // 默认值为 [0, 50]

    let newMinValue = parseFloat(minValue) - parseFloat(maxValue) * 0.05;
    let newMaxValue = parseFloat(maxValue) + parseFloat(maxValue) * 0.05;
    console.log("0920  newMinValue ---- :", newMinValue);
    console.log("0920  newMaxValue ---- :", newMaxValue);
    if (newMinValue > newMaxValue) {
        [newMinValue, newMaxValue] = [newMaxValue, newMinValue];
    }
    if (Math.abs(newMaxValue - newMinValue) < 1e-3) {
        newMinValue -= 2; // 给值一个小的偏移量
        newMaxValue += 2;
    }

    console.log("0920  newMinValue :", newMinValue);
    console.log("0920  newMaxValue :", newMaxValue);

    endTime = new Date(now.getTime() + samplingTime * 60 * 1000);

    const yScale = d3
        .scaleLinear()
        .domain([newMinValue, newMaxValue])
        .range([height, 0]);

    const xAxis = d3.axisTop(xScale).tickFormat((d) => {
        const dateObj = new Date(d);
        const timeStr = dateObj.toTimeString().split(" ")[0];
        return timeStr;
    });
    const yAxis = d3
        .axisRight(yScale)
        .tickFormat((d) => (d === minValue || d === 0.5 ? "" : d));

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
    svg.append("path")
        .datum(parsedData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line);
    
    renderVertical(svg, xScale, height);
   
};

const renderVertical = (svg, xScale, height) => {
    console.log("9090--------num-", num);

    const parsedData = num?.map((d) => ({
        ...d,
        timeStart: parseTime(d.time_start),
        timeEnd: parseTime(d.time_end),
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
    console.log("num:", num);
    const getXandY = (tube) => {
        const selectedTube = num.find((item) => item.tube === tube);
        // console.log("selectedTube---------- :", selectedTube);

        if (selectedTube) {
            return {
                x1: selectedTube.time_start,
                x2: selectedTube.time_end,
                color: selectedTube.color,
            };
        } else {
            return null; // 如果未找到匹配的 tube，则返回 null 或者其他你认为合适的值
        }
    };
    selected.forEach((selectTube) => {
        console.log("selectTube", selectTube["tube_list"]);
        let fillColor = "";
        // console.log("selectTube :", selectTube);
        selectTube["tube_list"].forEach((tube) => {
            // console.log("tube :", tube);

            const xy = getXandY(tube);
            // console.log("xy", xy);
            if (xy) {
                const { x1, x2, color } = xy;
                // console.log("x1, x2, color :", x1, x2, color);
                fillColor = color;
                // console.log("data :", data);

                let fillArea = data.filter((item) => {
                    return item.time >= x1 && item.time <= x2;
                });
                fillAreaData = [...fillAreaData, ...fillArea];
                // console.log("fillAreaData :", fillAreaData);
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
        // console.log("fillAreaData :", fillAreaData);
        let fill = { area: fillAreaData, color: fillColor };
        fillAreaDatas = [...fillAreaDatas, fill];
        fillAreaData = [];
    });

    // console.log("fillAreaDatas :", fillAreaDatas);
    fillAreaDatas.forEach((fill) => {
        // console.log("fill :", fill);
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
    // console.log("parsedTime", parsedTime);
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
//格式化为一致的格式（如'00:06:00'），然后再比较
const normalizeTime = (time) => time.padStart(8, "0");
const isEqual = (p1, p2) =>
    normalizeTime(p1.time) === normalizeTime(p2.time) && p1.value === p2.value;
const renderLine = (
    height,
    margin,
    svg,
    svgRef,
    setSelectedPoint,
    linePointChange,
  
    xScale
) => {
    console.log("1012 linePointChange :", linePointChange);
    const parsedData = linePointChange?.map((d) => ({
        ...d,
        time: parseTime(d.time),
    }));

    


    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    const y2Axis = d3
        .axisLeft(yScale)
        .tickFormat((d) => (d === 0 || d === 100 ? "" : d));

    const yAxisG = svg
        .append("g")
        .attr("transform", `translate(${margin.right - 1}, 0)`)
        .style("color", "blue")
        .call(y2Axis);
    yAxisG
        .selectAll(".tick text")
        .attr("x", -10)
        .attr("y", 0)
        .style("text-anchor", "end"); // 右对齐文本

    svg.selectAll("circle")
        .data(parsedData)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.time))
        .attr("cy", (d) => yScale(d.value))
        .attr("r", 7) // 设置圆点半径
        .attr("fill", "blue")
        .on("mouseover", function (event, d) {
            d3.select(this).style("opacity", 1); // 鼠标移入时显示圆点
            const [time, value] = d3.pointer(event, svgRef.current);
            console.log("time :", d.time);
            const dateObj = new Date(d.time);
            const timeStr = dateObj.toTimeString().split(" ")[0];
            // 获取鼠标位置
            svg.append("text")
                .attr("class", "coordinate-text")
                .attr("x", time + 10)
                .attr("y", value - 10)
                .text(`(${timeStr}, ${d.value})`)
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
    const handleClick = (event, d) => {
      
        setSelectedPoint({
            time: parseTimeString(d.time),
            value: d.value,
        });
        
        
    };
    // 折线生成器
    const line2 = d3
        .line()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.value))
        .curve(d3.curveLinear); // 使用 Cardinal 曲线插值
    // 绘制折线路径
    svg.append("path")
        .datum(parsedData)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", line2);
    
    

};

const LineChart = (props) => {
    // console.log("1014 --------------- LineChart -----------------");
    
    const svgRef = useRef(null);

    const [scrollPosition, setScrollPosition] = useState(0);
    const [realPosition, setRealPosition] = useState(0);
    const [maxScrollPosition, setMaxScrollPosition] = useState(100); // 假设最大滚动范围为1000

    const [dimensions, setDimensions] = useState(props.samplingTime);
    const [selectedPoint, setSelectedPoint] = useState(null);
    // console.log("1014 --------------- dimensions -----------------",dimensions);

    const [linePointChange, setlinePointChange] = useState([]);
    const [samplingTime, setSamplingTime] = useState(props.samplingTime);
    endTime = new Date(now.getTime() + samplingTime * 60 * 1000);



    // 修改状态
    const [zoomState, setZoomState] = useState({
        k: 1,
        x: 0,
        y: 0,
    });
    

    data = props.data;
    // console.log("data.props", props.data);
    num = props.num;
    linePoint = props.linePoint;
    
    selected = props.selected_tubes;

    useEffect(() => {
        setSamplingTime(props.samplingTime);
        setDimensions(props.dimensions);
    }, [props.samplingTime,props.dimensions]);
   

    // 在组件挂载时设置linePointChange的初始值
    useEffect(() => {
        if (linePointChange.length === 0) {
            setlinePointChange(linePoint);
        }
    }, [linePointChange, linePoint]); // 依赖项数组包含需要触发effect的变量
    
   

    const drawChart = useCallback(() => {
        // console.log("1014   dimensions", dimensions);
      

        if (!data || dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = dimensions.width - 200;
        const height = dimensions.height - 400;
        const margin = { top: 0, right: width, bottom: 10, left: 0 };

        const zoomedWidth = width * zoomState.k;

        updateMaxScroll(scrollPosition, zoomState.k);
        svg.attr("width", width).attr("height", height);

        const gContent = svg
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const zoomedXScale = d3
            .scaleTime()
            .domain([now, endTime])
            .range([
                zoomState.x - realPosition,
                width * zoomState.k + zoomState.x - realPosition,
            ]);

        // 绘制曲线
        renderCurve(
            gContent,
            height,
            samplingTime,
            zoomedXScale
        );
        renderLine(
            height,
            margin,
            gContent,
            svgRef,
            setSelectedPoint,
            linePointChange,
            zoomedXScale
        );
    }, [
        data,
        props.num,
        dimensions,
        zoomState,
        linePointChange,
        samplingTime,
        realPosition,
        scrollPosition,
    ]);

    useEffect(() => {
        // console.log("----1014---------props.sampling-----------",props.samplingTime);
        drawChart();
    }, [drawChart, props.samplingTime]);
  
    const handleZoomOut = useCallback(() => {
        setZoomState((prevState) => ({
            ...prevState,
            k: Math.max(prevState.k / 1.2, 1),
            x: 0,
            y: 0,
        }));
    }, []);
    const handleZoomIn = useCallback(() => {
        setZoomState((prevState) => ({
            ...prevState,
            k: Math.min(prevState.k * 1.2, 5),
        }));
    }, []);

    const handleScrollChange = (newPosition) => {
        updateMaxScroll(newPosition, zoomState.k);
        setScrollPosition(newPosition);
    };

    const updateMaxScroll = (position, k) => {
        const maxScroll = dimensions.width * k - dimensions.width;
        const percentage = (position / 100) * maxScroll; // 将 newPosition 转换为 0 到 1 之间的数
        setRealPosition(percentage);
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
                <svg ref={svgRef} width="100%" height="20rem"></svg>

            <div
                style={{
                    position: "absolute",
                    top: "10rem",
                    width: "100%",
                }}
            >
                <Row>
                    <Col span={17}></Col>
                    <Col span={2}>
                        {" "}
                        <div style={{paddingTop:"5rem"}}
                        >
                        <Button
                            icon={<PlusOutlined />}
                            onClick={handleZoomIn}
                        />
                        <Button
                            style={{ marginLeft: "10px"}}
                            icon={<MinusOutlined />}
                            onClick={handleZoomOut}

                        />
                        </div>
                    </Col>
                    <Col span={4}>
                        <CustomScrollbar
                            scrollPosition={scrollPosition}
                            maxScrollPosition={maxScrollPosition}
                            onScrollChange={handleScrollChange}
                        />
                    </Col>
                </Row>
            </div>
            
        </div>
    );
};
export default LineChart;
