import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
const LineChart = (props) => {
    const svgRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const data = props.data;
    const num = props.num;

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

        // 数据
        const svg = d3.select(svgRef.current);

        // SVG 宽度和高度
        const width = dimensions.width;
        const height = dimensions.height;
        const margin = { top: 20, right: 0, bottom: 10, left: 0 };

        // 创建 SVG 元素

        // 比例尺
        const xScale = d3.scaleLinear().domain([0, 21]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
        // 坐标轴
        const xAxis = d3.axisTop(xScale);
        const yAxis = d3.axisRight(yScale);

        // 绘制横坐标轴
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .style("color", "red") // 设置坐标轴颜色为红色
            .call(xAxis);

        // 绘制纵坐标轴
        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .style("color", "red") // 设置坐标轴颜色为红色
            .call(yAxis);
        d3.select(svgRef.current).selectAll("text").remove();
        // 绘制数据点
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d.x))
            .attr("cy", (d) => yScale(d.y))
            .attr("r", 5) // 设置圆点半径
            .attr("fill", "red")
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
            .curve(d3.curveCardinal); // 使用 Cardinal 曲线插值

        // 绘制折线路径
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("d", line);

        const lineX = d3
            .line()
            .x((d) => xScale(d.x))
            .y(height)
            .curve(d3.curveCardinal);
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("d", lineX);
        // 生成垂直虚线的路径生成器
        const lineVertical = (d) => {
            return `M${xScale(d.x)},${height}V${0}`;
        };

        // 绘制垂直虚线
        svg.selectAll(".vertical-line")
            .data(data)
            .enter()
            .append("path")
            .attr("class", "vertical-line")
            .attr("stroke", "red")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5") // 设置虚线样式
            .attr("d", lineVertical);
        //生成flag
        svg.selectAll(".flag-text")
            .data(num)
            .enter()
            .append("text")
            .attr("class", "flag-text")
            .attr("x", (d) => (xScale(d.y) - xScale(d.x)) / 2 + xScale(d.x))
            .attr("y", 30) // 计算中间位置的 y 坐标

            .attr("text-anchor", "middle")
            .text((d) => d.flag);
    }, [data, dimensions]); // 仅在组件挂载时执行一次

    return (
        <div
            className="headerStyle"
            style={{
                width: "100%",
                height: "300px",
                border: "none",
                position: "relative",
                top: "-10px",
            }}
        >
            <svg ref={svgRef} width="100%" height="100%"></svg>
        </div>
    );
};

export default LineChart;
