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
import "./line.css";
import KeyboardNumber from "@components/keyboard/number/index.js";
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
// let linePointChange = [];
let linePoint = [];
let selected = [];
let now;
let endTime;
// let lineFlag;
const _ = require("lodash");

now = new Date();
now.setHours(0, 0, 0, 0); // 起点固定为当天 00:00

// let now = new Date();
// now.setHours(1, 0, 0);
// const endTime = new Date(now.getTime() + 5 * 60 * 1000);

const renderCurve = (
    svg,
    width,
    height,
    margin,
    cleanFlag,
    samplingTime,
    xScale,
    kCompensate = 1
) => {
    // // console.log("data", data);
    //data{time: '17:46:47', value: 81.41712213857508}
    const parsedData =
        data?.map((d) => ({
            ...d,
            time: parseTime(d.time),
            value: Number(d.value),
        })) || [];
    // 过滤掉非法时间或非法数值，避免 y/x 轴 domain 退化
    const validData = parsedData
        .filter(
            (d) =>
                Number.isFinite(d.value) &&
                d.time instanceof Date &&
                !isNaN(d.time.getTime())
        )
        .sort((a, b) => a.time - b.time); // 按时间排序，避免乱序导致曲线异常
    const hasValidData = validData.length > 0;

    console.log("0920   data--------------------", validData);
    const valueExtent = d3.extent(
        hasValidData ? validData : [{ value: 0 }],
        (d) => d.value
    );

    let [minValue, maxValue] = valueExtent || [];
    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
        // 数据全无效时使用默认轴范围，保证轴始终存在
        minValue = -3;
        maxValue = 53;
    }

    if (minValue === maxValue) {
        minValue -= 2; // 全 0 时给出上下边界
        maxValue += 2;
    }
    const padding = Math.max(Math.abs(maxValue), 1) * 0.05;

    // const xScale = d3.scaleTime().domain([now, endTime]).range([0, width]);
    const yScale = d3
        .scaleLinear()
        .domain([minValue - padding, maxValue + padding])
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
        .style("color", "#00838f")
        .call(xAxis);
    svg.append("g")
        .attr("transform", `translate(0, 0)`)
        .style("color", "#00838f")
        .call(yAxis);
    const line = d3
        .line()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.value))
        .curve(d3.curveBasis);

    // 创建渐变定义
    const gradientId = "curveGradient";
    const defs = svg.append("defs");
    const gradient = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#00bcd4")
        .attr("stop-opacity", 1);

    gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#0097a7")
        .attr("stop-opacity", 1);

    // // console.log("par", parsedData);
    // 单个点/无效数据时兜底：复制点或画一条水平线，避免路径瞬间消失
    const baseValue = hasValidData ? validData[0].value : 0;
    const allTimesSame =
        hasValidData &&
        validData.every(
            (d) => d.time.getTime() === validData[0].time.getTime()
        );
    // 时间全相同或无数据时，用 x 轴两端生成基线，避免 0 长度路径瞬间消失
    const lineData =
        hasValidData && !allTimesSame
            ? validData.length === 1
                ? [validData[0], { ...validData[0] }]
                : validData
            : [
                  { time: now, value: baseValue },
                  { time: endTime, value: baseValue },
              ];
    console.log("1201   validData--------------------", validData);

    console.log("1201   lineData--------------------", lineData);
    svg.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", `url(#${gradientId})`)
        .attr("stroke-width", 3 * kCompensate)
        .attr("d", line)
        .style("filter", `drop-shadow(0px ${2 * kCompensate}px ${4 * kCompensate}px rgba(0, 188, 212, 0.3))`);

    // 单个点时额外画一个点标记
    if (hasValidData && validData.length === 1) {
        svg.append("circle")
            .attr("cx", xScale(validData[0].time))
            .attr("cy", yScale(validData[0].value))
            .attr("r", 3)
            .attr("fill", `url(#${gradientId})`);
    }
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
    // console.log("cleanFlag", cleanFlag);
    // if (cleanFlag == 0) {
    renderArea(svg, xScale, yScale, height);
    // }
};

const renderVertical = (svg, xScale, height) => {
    // // console.log("9090--------num-", num);

    const parsedData = num?.map((d) => ({
        ...d,
        timeStart: parseTime(d.time_start),
        timeEnd: parseTime(d.time_end),
    }));
    // 鐢熸垚鍨傜洿铏氱嚎鐨勮矾寰勭敓鎴愬櫒
    const lineVertical = (d) => {
        return `M${xScale(d.timeEnd)},${height}V${0}`;
    };
    // 缁樺埗鍨傜洿铏氱嚎
    svg.selectAll(".vertical-line")
        .data(parsedData)
        .enter()
        .append("path")
        .attr("class", "vertical-line")
        .attr("stroke", "#546e7a")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,5") // 璁剧疆铏氱嚎鏍峰紡
        .attr("d", lineVertical)
        .style("opacity", 0.8);
    // //鐢熸垚flag
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
        .attr("y", 30) // 璁＄畻涓棿浣嶇疆鐨?y 鍧愭爣
        .attr("text-anchor", "middle")
        .text((d) => `${d.module_index + 1}-${d.tube_index + 1}`);
};

const renderArea = (svg, xScale, yScale, height) => {
    // console.log("1118  renderArea start", Date.now());
    // 清除旧的填充，避免重复叠加
    svg.selectAll(".fill-area").remove();

    const area = d3
        .area()
        .x((d) => xScale(d.time))
        .y0(height)
        .y1((d) => yScale(d.value))
        .curve(d3.curveLinear);

    // console.log("1021   num:", num);
    console.log("1203 selectedAllTubes  selected:", selected);
    // console.log("1118 selected count", selected.length);
    selected.forEach((selectTube) => {
        // console.log("1021 selectTube", selectTube);
        // console.log("1021   selectTube :", selectTube);

        const fillColor = selectTube.color;
        const fillArea = data
            .filter(
                (item) =>
                    item.time >= selectTube.time_start &&
                    item.time <= selectTube.time_end
            )
            .map((item) => ({
                ...item,
                color: fillColor,
            }));
        // console.log(
        //     "1118  fillArea length",
        //     fillArea.length,
        //     "time range",
        //     selectTube.time_start,
        //     selectTube.time_end
        // );
        const sortedArea = [...fillArea].sort((a, b) => a.time - b.time);
        fillAreaDatas = [
            ...fillAreaDatas,
            { area: sortedArea, color: fillColor },
        ];
    });

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
                .attr("class", "fill-area")
                .attr("fill", colors[colorName].backgroundColor)
                .attr("stroke", "none")
                .attr("d", area);
        }
    });
    // console.log("1118  fill-area paths", svg.selectAll(".fill-area").size());
    fillAreaDatas = [];
};
const parseTime = (timeString) => {
    // 瑙ｆ瀽鏃堕棿瀛楃涓?
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const parsedTime = new Date();
    parsedTime.setHours(hours, minutes, seconds, 0);
    return parsedTime;
};
const parseTimeString = (time) => {
    const date = new Date(time);

    const parseTimeString = date.toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
    return parseTimeString;
};
//鏍煎紡鍖栦负涓€鑷寸殑鏍煎紡锛堝'00:06:00'锛夛紝鐒跺悗鍐嶆瘮杈?
const normalizeTime = (time) => time.padStart(8, "0");
const isEqual = (p1, p2) =>
    normalizeTime(p1.time) === normalizeTime(p2.time) && p1.value === p2.value;
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
    setlinePointChange,
    callback,
    samplingTime,
    lineFlag,
    xScale
) => {
    // console.log("1012 time linePointChange :", linePointChange);
    linePointChange?.sort((a, b) => {
        const timeA = a.time
            .split(":")
            .reduce((acc, time) => 60 * acc + +time, 0);
        const timeB = b.time
            .split(":")
            .reduce((acc, time) => 60 * acc + +time, 0);
        return timeA - timeB; // 浠庡皬鍒板ぇ鎺掑簭
    });
    const parsedData = linePointChange?.map((d) => ({
        ...d,
        time: parseTime(d.time),
    }));

    // const drag = d3
    //     .drag()
    //     .on("start", dragstarted)
    //     .on("drag", dragged)
    //     .on("end", dragended);

    let delD = [];
    let newD = [];
    let ifMove = [];
    svg.selectAll("path.line").remove();
    svg.selectAll("circle.point").remove();
    // endTime = new Date(now.getTime() + samplingTime * 60 * 1000);

    // const x2Scale = d3.scaleLinear().domain([now, endTime]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 105]).range([height, 0]);
    // const x2Axis = d3.axisTop(xScale);
    const y2Axis = d3
        .axisLeft(yScale)
        .tickFormat((d) => (d === 0 || d === 105 ? "" : d));

    const yAxisG = svg
        .append("g")
        .attr("transform", `translate(${margin.right - 1}, 0)`)
        .style("color", "#f57c00")
        .call(y2Axis);
    yAxisG.selectAll(".tick text").attr("x", -10).attr("y", 0); // 鍙冲榻愭枃鏈?

    const line2 = d3
        .line()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.value))
        .curve(d3.curveLinear);
    // console.log("8672 parsedData", parsedData);
    svg.append("path")
        .attr("class", "line")
        .datum(parsedData)
        .attr("fill", "none")
        .attr("stroke", "#ff9800")
        .attr("stroke-width", 3)
        .attr("d", line2)
        .style("pointer-events", "none");

    const points = svg
        .selectAll("circle.point")
        .data(parsedData)
        .join("circle")
        .attr("class", "point")
        .attr("cx", (d) => xScale(d.time))
        .attr("cy", (d) => yScale(d.value))
        .attr("r", 1)
        .style("opacity", 1)
        .attr("fill", "#ff9800")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .style("pointer-events", "all");
    const gridLines = svg
        .append("g")
        .attr("class", "grid-lines")
        .attr("transform", `translate(0, 0)`);
    const ticks = d3.range(0, 105, 10);

    gridLines
        .selectAll("line")
        .data(ticks)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", (d) => yScale(d))
        .attr("y2", (d) => yScale(d))
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .style("opacity", 0.6); // 璁剧疆铏氱嚎鏍峰紡
    points.each(function () {
        // 浣跨敤 each 鏉ョ‘淇濇瘡涓偣閮界粦瀹氫簡浜嬩欢
        const point = d3.select(this);
        point
            .on("mouseover", function (event, d) {
                // console.log("1101   event", event, d);

                // d3.select(this).style("opacity", 1);
                const dateObj = new Date(d.time);
                const timeStr = dateObj.toTimeString().split(" ")[0];

                svg.append("text")
                    .attr("class", "coordinate-text")
                    .attr("x", xScale(d.time) + 10)
                    .attr("y", yScale(d.value) - 10)
                    .text(`(${timeStr}, ${d.value})`)
                    .attr("font-size", "12px")
                    .attr("fill", "black")
                    .style("pointer-events", "none");
            })
            .on("mouseout", function () {
                svg.selectAll(".coordinate-text").remove();
            })
            .on("click", function (event, d) {
                handleClick(event, d);
            });
    });

    // .call(drag);
    const handleClick = (event, d) => {
        // // console.log("lineFlag", lineFlag);
        // if (lineFlag == 1) {
        setSelectedPoint({
            time: parseTimeString(d.time),
            value: d.value,
        });
        setInputValues({
            flow_rate: d.flow_rate,
            time: d.time,
            value: d.value,
        });
        setIsModalVisible(true);
    };

    const dragThreshold = 300;
    let startX, startY;
    let isDragging = false;
    let dragTimeout;

    function prepareDrag(event, d) {
        startX = event.x;
        startY = event.y;
    }
};

const LineChart = (props) => {
    const svgRef = useRef(null);

    const [scrollPosition, setScrollPosition] = useState(0);
    const [realPosition, setRealPosition] = useState(0);
    const [maxScrollPosition, setMaxScrollPosition] = useState(100);

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [inputValues, setInputValues] = useState({
        flow_rate: "",
        time: "",
        value: "",
    });
    const [linePointChange, setlinePointChange] = useState([]);
    const [samplingTime, setSamplingTime] = useState(props.samplingTime);
    const [lineFlag, setLineFlag] = useState(1);
    const [lineLoading, setLineLoading] = useState(props.lineLoading);
    endTime = new Date(now.getTime() + samplingTime * 60 * 1000);

    // // console.log("8672  samplingTime", samplingTime);
    // // console.log("lineFlag   lineFlag", lineFlag);

    const [zoomState, setZoomState] = useState({
        k: 1,
        x: 0,
        y: 0,
    });
    // console.log(
    //     "0923 -------------------------------zoomState--------------------------------- :"
    // );

    data = props.data;
    // console.log("data.props", props.data);
    num = props.num;
    let cleanFlag = props.clean_flag;
    linePoint = props.linePoint;
    // console.log("1012 props :", props);
    // if (linePointChange.length == 0) {
    //     setlinePointChange(linePoint);
    // }
    // console.log("1118  selectedAllTubes", props.selectedAllTubes);
    selected = props.selectedAllTubes;
    // console.log("1021   selected", selected);

    useEffect(() => {
        setSamplingTime(props.samplingTime);
    }, [props.samplingTime]);
    useEffect(() => {
        setLineFlag(props.lineFlag);
        setLineLoading(props.lineLoading);
    }, [props.lineFlag, props.lineLoading]);

    // console.log("lineFlag   lineFlag   2---", props.lineFlag);

    // 鍦ㄧ粍浠舵寕杞芥椂璁剧疆linePointChange鐨勫垵濮嬪€?
    useEffect(() => {
        // console.log("1029  props.linePoint", props.linePoint);

        setlinePointChange((pre) => props.linePoint);

        // if (linePointChange.length === 0) {
        //     setlinePointChange(linePoint);
        // }
    }, [props.linePoint]); // 渚濊禆椤规暟缁勫寘鍚渶瑕佽Е鍙慹ffect鐨勫彉閲?
    const setHight = () => {
        const headerDiv = document.querySelector(".headerStyle");
        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });
        resizeObserver.observe(headerDiv);
        return () => {
            resizeObserver.disconnect();
        };
    };
    useEffect(() => {
        setHight();
    }, []);

    const drawChart = useCallback(() => {
        // console.log("1014   dimensions", dimensions);

        if (!data || dimensions.width === 0 || dimensions.height === 0) return;

        const safeSampling = samplingTime > 0 ? samplingTime : 1;
        endTime = new Date(now.getTime() + safeSampling * 60 * 1000); // 保持从 00:00 开始的固定跨度

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = dimensions.width;
        const height = dimensions.height;
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
        // console.log("1021    props---------------5");

        // 缁樺埗鏇茬嚎
        // 影刃：动态补偿因子 — 缩放时保持视觉一致性
        const kCompensate = 1 / Math.sqrt(zoomState.k);

        renderCurve(
            gContent,
            zoomedWidth,
            height,
            margin,
            props.clean_flag,
            samplingTime,
            zoomedXScale,
            kCompensate
        );
        renderLine(
            zoomedWidth,
            height,
            margin,
            gContent,
            svgRef,
            setSelectedPoint,
            setInputValues,
            setIsModalVisible,
            linePointChange,
            setlinePointChange,
            props.callback,
            samplingTime,
            lineFlag,
            zoomedXScale
        );
    }, [
        data,
        props.num,
        dimensions,
        zoomState,
        linePointChange,
        samplingTime,
        lineFlag,
        props.clean_flag,
        realPosition,
        scrollPosition,
        selected,
    ]);

    // ====== 影刃：D3 多点触控 Pinch-to-Zoom ======
    useEffect(() => {
        if (!svgRef.current || dimensions.width === 0) return;

        const svgEl = d3.select(svgRef.current);
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [dimensions.width * 8, dimensions.height]])
            .filter((event) => {
                // 允许触控事件（touch）和鼠标滚轮，阻止鼠标拖拽（留给点击交互）
                if (event.type === 'wheel') return true;
                if (event.touches && event.touches.length >= 2) return true;
                return false;
            })
            .on("zoom", (event) => {
                const { k, x } = event.transform;
                setZoomState({ k, x, y: 0 });
            });

        svgEl.call(zoom);

        // 双击复位：由铁毡负责，此处仅确保 zoom 不拦截 dblclick
        svgEl.on("dblclick.zoom", () => {
            setZoomState({ k: 1, x: 0, y: 0 });
            setScrollPosition(0);
            setRealPosition(0);
        });

        return () => {
            svgEl.on(".zoom", null);
        };
    }, [dimensions]);

    useEffect(() => {
        // console.log("1014    props", props);
        setlinePointChange((pre) => props.linePoint);

        drawChart();
    }, [drawChart, props.samplingTime, props.linePoint]);
    // useEffect(() => {
    //     if (svgRef.current) {
    //         drawChart();
    //     }
    // }, [drawChart, props.data, props.num, props.linePoint, props.samplingTime]);

    const handleOk = () => {
        const newX = parseTimeString(inputValues.time);

        const newY = Number(inputValues.value);

        let newData = linePointChange.map((point) =>
            isEqual(selectedPoint, point)
                ? { flow_rate: inputValues.flow_rate, time: newX, value: newY }
                : point
        );
        newData = newData.sort((a, b) => parseTime(a.time) - parseTime(b.time));
        setlinePointChange(newData);

        // // console.log("lineFlag    newData :", newData);
        props.callback(newData); // 纭繚璋冪敤浜嗗洖璋冨嚱鏁?
        // // console.log("lineFlag  linePoint----------- :", linePoint);
        // // console.log("lineFlag  linePointChange----------- :", linePointChange);
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleInputChange = (e) => {
        let time = e.$d ? e.$d : inputValues.time;
        let value = e.$d ? inputValues.value : e;
        // console.log("inputNumber value :", value);

        setInputValues({
            flow_rate: inputValues.flow_rate,
            time: time,
            value: inputValues.value,
        });
    };
    const inputRef = useRef(null);
    const timeRef = useRef(null);

    const handleReceiveFlags = (inputNumber) => {
        // inputNumber
        // console.log("inputRef.current :", inputRef.current);
        // console.log("inputRef.timeRef :", timeRef.current);
        if (inputRef.current) {
            inputRef.current.focus();
            let result = NaN;
            if (typeof inputNumber !== "number") {
                const concatenatedStr = inputNumber.join("");
                result = concatenatedStr;
            } else {
                result = inputNumber;
            }
            setInputValues({
                flow_rate: inputValues.flow_rate,
                time: inputValues.time,
                value: result,
            });
        }
        // if (timeRef.current) {
        //     timeRef.current.focus();
        // }
    };

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
        const percentage = (position / 100) * maxScroll;
        setRealPosition(percentage);
    };

    return (
        <div
            className="headerStyle"
            style={{
                width: "97%",
                height: "250px",
                border: "none",
                position: "relative",
                top: "0px",
            }}
        >
            <svg
                ref={svgRef}
                width="100%"
                height="20rem"
                style={{ position: "relative", zIndex: 1, touchAction: "none" }}
            ></svg>

            <div
                style={{
                    position: "absolute",
                    top: "15rem",
                    width: "100%",
                    zIndex: 2,
                    pointerEvents: "none",
                    height: "0px",
                }}
            >
                <Row>
                    <Col span={17} style={{ height: "0rem" }}></Col>
                    <Col span={2} style={{ height: "0rem" }}>
                    <div className="zoomBtnGroup">
                        <Button
                            icon={<PlusOutlined />}
                            onClick={handleZoomIn}
                            className="zoomBtn"
                            size="small"
                            style={{ pointerEvents: "auto" }}
                        />
                        <Button
                            className="zoomBtn"
                            size="small"
                            style={{
                                marginLeft: "4px",
                                pointerEvents: "auto",
                            }}
                            icon={<MinusOutlined />}
                            onClick={handleZoomOut}
                        />
                        </div>
                    </Col>
                    {/* <Col
                        span={4}
                    >
                        <div style={{marginTop:"0"}}>
                        <CustomScrollbar
                            style={{ pointerEvents: "auto" ,marginTop:"0 !important"}}
                            scrollPosition={scrollPosition}
                            maxScrollPosition={maxScrollPosition}
                            onScrollChange={handleScrollChange}
                        />
                        </div>
                    </Col> */}
                </Row>
            </div>
            <Modal
                title="梯度洗脱"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={400}
            >
                <TimePicker
                    className="input-time"
                    ref={timeRef}
                    value={dayjs(parseTimeString(inputValues.time), "HH:mm:ss")}
                    onChange={handleInputChange}
                    allowClear={false}
                    showNow={false}
                />

                <Input
                    ref={inputRef}
                    className="input-number"
                    value={inputValues.value}
                    min={0}
                    max={100}
                    // formatter={(value) => `${value}%`}
                    // parser={(value) => value?.replace("%", "")}
                    // onChange={handleInputChange}
                    controls={false}
                />
                {/* <Input
                    ref={inputRef}
                    className="input-number"
                    value={inputValues.flow_rate}
                    min={0}
                    max={100}
                    // formatter={(value) => `${value}%`}
                    // parser={(value) => value?.replace("%", "")}
                    // onChange={handleInputChange}
                    controls={false}
                    disabled
                /> */}
                <KeyboardNumber
                    className="input-keyboard"
                    value={inputValues.value}
                    callback={handleReceiveFlags}
                ></KeyboardNumber>
            </Modal>
        </div>
    );
};
export default LineChart;
