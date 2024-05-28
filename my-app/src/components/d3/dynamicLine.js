import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./dynamicLine.css";
let data = [
    { x: 0, y: 20 },
    { x: 1, y: 20 },
    { x: 3, y: 20 },
    { x: 4, y: 71 },
    { x: 5, y: 71 },
    { x: 7, y: 71 },
    { x: 8, y: 71 },
    { x: 9, y: 71 },
];
// const lineData = (props) => {
//     data = props.data;
// };

const DynamicLine = (props) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const svgRef = useRef(null);

    // lineData(props);
    console.log("i am here");
    // 监听 headerStyle 的大小变化
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

        const svg = d3.select(svgRef.current);

        const width = dimensions.width;
        const height = dimensions.height;
        const margin = { top: 0, right: 0, bottom: 30, left: 0 };
        // 比例尺
        const xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
        // 坐标轴
        const xAxis = d3.axisTop(xScale);
        const yAxis = d3.axisRight(yScale);

        // 绘制数据点
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d.x))
            .attr("cy", (d) => yScale(d.y))
            .attr("r", 5) // 设置圆点半径
            .attr("fill", "blue")
            .on("mouseover", function (event, d) {
                d3.select(this).style("opacity", 1); // 鼠标移入时显示圆点
                const [x, y] = d3.pointer(event, svgRef.current);
                // 获取鼠标位置
                svg.append("text")
                    .attr("class", "coordinate-text")
                    .attr("x", x + 10)
                    .attr("y", y - 10)
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
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("d", line);
    });

    return (
        <div className="lineChart">
            <svg ref={svgRef} width="100%" height="100%"></svg>
        </div>
    );
};

export default DynamicLine;
