import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./dynamicLine.css";
// let data = [
//     { x: 0, y: 20 },
//     { x: 1, y: 20 },
//     { x: 3, y: 20 },
//     { x: 4, y: 71 },
//     { x: 5, y: 71 },
//     { x: 7, y: 71 },
//     { x: 8, y: 71 },
//     { x: 9, y: 71 },
// ];
// const lineData = (props) => {
//     data = props.data;
// };

const DynamicLine = (props) => {
    const [xTime, setXTime] = useState(props.samplingTime);
    const [widthLine, setWidthLine] = useState(props.widthLine);
    const [heightLine, setHeightLine] = useState(props.heightLine);
    const [dimensions, setDimensions] = useState({
        width: widthLine,
        height: heightLine,
    });
    const svgRef = useRef(null);
    const transformAndSortData = (data) => {
        return data
            .filter((d) => d.time !== undefined || d.pumpB !== undefined)
            .map((d) => ({ x: d.time, y: d.pumpB }))
            .sort((a, b) => a.x - b.x);
    };

    useEffect(() => {
        console.log("9999 propsline------------ :", props);
        setXTime(props.samplingTime);
        const data = transformAndSortData(props.pressure);

        if (!data || dimensions.width === 0 || dimensions.height === 0) return;
        d3.select(svgRef.current).selectAll("*").remove();
        const margin = { top: 0, right: 0, bottom: 30, left: 40 };

        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;
        const svg = d3
            .select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // 比例尺
        const xScale = d3.scaleLinear().domain([0, xTime]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
        // 上边的横坐标轴（隐藏刻度）
        const xAxisTop = d3.axisTop(xScale).tickSize(0).tickFormat("");
        svg.append("g")
            .attr("transform", `translate(0,0)`)
            .style("color", "gray")
            .call(xAxisTop);

        // 下边的横坐标轴（刻度在下面）
        const xAxisBottom = d3
            .axisBottom(xScale)
            .tickFormat((d) => (d === props.samplingTime ? "" : d));
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .style("color", "gray")
            .call(xAxisBottom);

        // 左边的纵坐标轴（刻度在左侧）
        const yAxisLeft = d3
            .axisLeft(yScale)
            .tickFormat((d) => (d === 100 ? "" : d));
        svg.append("g")
            .attr("transform", `translate(0,0)`)
            .style("color", "gray")
            .call(yAxisLeft);

        // 右边的纵坐标轴（隐藏刻度）
        const yAxisRight = d3.axisRight(yScale).tickSize(0).tickFormat("");
        svg.append("g")
            .attr("transform", `translate(${width - 2},0)`)
            .style("color", "gray")
            .call(yAxisRight);

        // 添加网格线
        const xGrid = d3
            .axisBottom(xScale)
            .tickSize(-height)
            .tickFormat("")
            .ticks(10);

        const yGrid = d3
            .axisLeft(yScale)
            .tickSize(-width)
            .tickFormat("")
            .ticks(10);

        svg.append("g")
            .attr("class", "x grid")
            .attr("transform", `translate(0,${height})`)
            .call(xGrid);

        svg.append("g").attr("class", "y grid").call(yGrid);

        // 绘制数据点
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d.x))
            .attr("cy", (d) => yScale(d.y))
            .attr("r", 3) // 设置圆点半径
            .attr("fill", "blue")
            .on("mouseover", function (event, d) {
                d3.select(this).style("opacity", 1); // 鼠标移入时显示圆点
                const [x, y] = d3.pointer(event, svgRef.current);
                // 获取鼠标位置
                svg.append("text")
                    .attr("class", "coordinate-text")
                    .attr("x", x)
                    .attr("y", y - 3)
                    .text(`(${d.x}, ${d.y})`)
                    .attr("font-size", "12px")
                    .attr("fill", "black")
                    .attr("pointer-events", "none"); // 防止文字影响鼠标事件
            })
            .on("mouseout", function () {
                svg.selectAll(".coordinate-text").remove(); // 移除显示的坐标信息
            });

        // 折线生成器
        const line = d3
            .line()
            .x((d) => xScale(d.x))
            .y((d) => yScale(d.y))
            .curve(d3.curveLinear); // 使用 Cardinal 曲线插值

        // 绘制折线路径
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("d", line);
    }, [props, dimensions, xTime]);

    return (
        <div className="lineChart">
            <svg ref={svgRef} width="100%" height="100%"></svg>
        </div>
    );
};

export default DynamicLine;
