import React, { useEffect, useRef, useState } from "react";
import "./notice.css";
import { FloatButton, Drawer } from "antd";

function App() {
    useEffect(() => {
        const handleSmoothScroll = (event) => {
            // if (event.target.classList.contains("smooth-scroll")) {
            //     event.preventDefault();
            //     const targetId = event.target.getAttribute("href").substring(1);
            //     const targetElement = document.getElementById(targetId);
            //     // if (targetElement) {
            //     //     window.scrollTo({
            //     //         top: targetElement.offsetTop,
            //     //         behavior: "smooth",
            //     //     });
            //     // }
            // }
        };

        document.addEventListener("click", handleSmoothScroll);

        return () => {
            document.removeEventListener("click", handleSmoothScroll);
        };
    }, []);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // const backTop = () => {
    //     const appDiv = document.querySelector(".App");
    //     console.log("setDimensions :", dimensions);

    //     const resizeObserver = new ResizeObserver((entries) => {
    //         const { width, height } = entries[0].contentRect;
    //         setDimensions({ width, height });
    //         console.log("setDimensions :", dimensions);
    //     });
    //     resizeObserver.observe(appDiv);

    //     console.log("---------");
    //     window.scrollTo({
    //         top: 0,
    //         behavior: "smooth",
    //     });
    // };
    // const handleClick = () => {
    //     document.querySelector(".App").scroll(0, 0);
    // };

    return (
        <div className="App" style={{ height: "100%", overflow: "scroll" }}>
            <FloatButton.Group shape="circle">
                <FloatButton.BackTop
                // visibilityHeight={0}
                // onClick={handleClick}
                // duration={900}
                />
            </FloatButton.Group>
            <header className="App-header">
                <h1>色谱仪软件用户手册</h1>
            </header>
            <nav>
                <ul>
                    <li>
                        <a href="#introduction" className="smooth-scroll">
                            1. 介绍
                        </a>
                    </li>
                    <li>
                        <a href="#requirements" className="smooth-scroll">
                            2. 系统要求
                        </a>
                    </li>
                    <li>
                        <a href="#installation" className="smooth-scroll">
                            3. 安装
                        </a>
                    </li>
                    <li>
                        <a href="#quickstart" className="smooth-scroll">
                            4. 快速开始
                        </a>
                    </li>
                    <li>
                        <a href="#overview" className="smooth-scroll">
                            5. 主界面概述
                        </a>
                    </li>
                    <li>
                        <a href="#instructions" className="smooth-scroll">
                            6. 操作说明
                        </a>
                    </li>
                    <li>
                        <a href="#data" className="smooth-scroll">
                            7. 数据分析
                        </a>
                    </li>
                    <li>
                        <a href="#maintenance" className="smooth-scroll">
                            8. 维护和故障排除
                        </a>
                    </li>
                    <li>
                        <a href="#contact" className="smooth-scroll">
                            9. 联系信息
                        </a>
                    </li>
                </ul>
            </nav>
            <section id="introduction">
                <h2>1. 介绍</h2>
                <p>
                    欢迎使用色谱仪软件用户手册。本手册旨在指导您了解和使用该软件的功能，帮助您有效地操作和利用色谱分析软件的各种功能。
                </p>
            </section>
            <section id="requirements">
                <h2>2. 系统要求</h2>
                <p>
                    操作系统: Windows 10 或更高版本
                    <br />
                    处理器: Intel i5 或更高配置
                    <br />
                    内存: 至少 8 GB
                    <br />
                    存储: 至少 1 GB 的可用空间
                    <br />
                    显示: 1920 x 1080 分辨率或更高
                </p>
            </section>
            <section id="installation">
                <h2>3. 安装</h2>
                <h3>下载与安装步骤</h3>
                <p>
                    1. 下载软件: 请从指定的网站下载最新版本的色谱仪软件安装包。
                    <br />
                    2. 运行安装程序:
                    双击下载的安装包，按照屏幕上的指示进行安装。
                    <br />
                    3. 完成安装:
                    安装完成后，您可以在桌面或开始菜单中找到色谱仪软件的快捷方式。
                </p>
                <h3>安装注意事项</h3>
                <p>
                    确保您的计算机满足系统要求。在安装过程中，请勿关闭安装程序窗口。
                </p>
            </section>
            <section id="quickstart">
                <h2>4. 快速开始</h2>
                <h3>启动软件</h3>
                <p>
                    1. 打开软件: 双击桌面上的色谱仪软件图标，启动软件。
                    <br />
                    2. 登录:
                    输入您的用户名和密码进行登录。如果您是首次使用，请注册一个新账户。
                </p>
                <h3>初始设置</h3>
                <p>
                    1. 连接设备:
                    确保色谱仪与计算机正确连接，并在软件中选择相应的端口进行连接。
                    <br />
                    2. 校准仪器: 按照提示完成色谱仪的校准步骤。
                </p>
            </section>
            <section id="overview">
                <h2>5. 主界面概述</h2>
                <h3>主界面组成</h3>
                <p>
                    顶部菜单栏: 包含文件、编辑、视图、帮助等菜单选项。
                    <br />
                    图表显示区: 显示实时色谱图。
                    <br />
                    控制面板: 包含开始、暂停、停止、复位等操作按钮。
                    <br />
                    试管列表: 显示当前样品试管的状态和编号。
                    <br />
                    任务列表: 显示当前进行中的任务和操作步骤。
                </p>
                <h3>功能按钮介绍</h3>
                <p>
                    开始 (红色按钮): 启动色谱分析。
                    <br />
                    暂停 (灰色按钮): 暂停当前分析。
                    <br />
                    停止 (蓝色按钮): 停止分析并保存数据。
                    <br />
                    复位 (蓝色按钮): 重置系统，准备进行下一次分析。
                </p>
            </section>
            <section id="instructions">
                <h2>6. 操作说明</h2>
                <h3>样品加载</h3>
                <p>
                    选择试管: 在试管列表中选择要分析的样品试管。
                    <br />
                    加载样品: 将样品试管放置在指定位置，并在软件中确认样品信息。
                </p>
                <h3>开始分析</h3>
                <p>
                    启动分析: 点击“开始”按钮，软件将开始进行色谱分析。
                    <br />
                    监控进程: 在图表显示区实时监控色谱图的变化。
                </p>
                <h3>暂停和停止</h3>
                <p>
                    暂停: 点击“暂停”按钮可以暂时中断分析，再次点击可以继续。
                    <br />
                    停止: 点击“停止”按钮可以终止分析并保存当前数据。
                </p>
            </section>
            <section id="data">
                <h2>7. 数据分析</h2>
                <h3>实时数据监控</h3>
                <p>
                    图表显示:
                    实时显示色谱图，用户可以根据需要放大或缩小图表以查看详细信息。
                    <br />
                    数据记录:
                    软件自动记录每次分析的数据，用户可以在数据管理界面查看和导出分析结果。
                </p>
                <h3>数据导出</h3>
                <p>
                    选择数据: 在数据管理界面选择要导出的分析数据。
                    <br />
                    导出格式: 选择导出格式（如Excel、CSV等）。
                    <br />
                    保存数据: 选择保存路径并确认导出。
                </p>
            </section>
            <section id="maintenance">
                <h2>8. 维护和故障排除</h2>
                <h3>常见问题及解决办法</h3>
                <p>
                    无法连接色谱仪:
                    检查连接线缆和端口设置，确保色谱仪和计算机正确连接。
                    <br />
                    软件崩溃: 重新启动软件并检查系统更新，确保软件版本是最新的。
                </p>
                <h3>软件更新</h3>
                <p>
                    检查更新: 在帮助菜单中选择“检查更新”。
                    <br />
                    下载更新: 如果有新版本可用，按照提示下载并安装更新。
                </p>
            </section>
            <section id="contact">
                <h2>9. 联系信息</h2>
                <p>
                    如需技术支持或有任何问题，请联系软件供应商：
                    <br />
                    电话: 123-456-7890
                    <br />
                    邮箱: support@chromatographysoftware.com
                    <br />
                    地址: 北京市XX区XX路XX号
                </p>
                <p>
                    感谢您使用色谱仪软件！希望本手册能帮助您更好地利用本软件进行色谱分析。如果您有任何建议或反馈，请随时与我们联系。
                </p>
            </section>
        </div>
    );
}

export default App;
