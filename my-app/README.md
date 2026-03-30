# Chromatograph — 液相色谱智能控制终端

基于 React + Ant Design + D3.js + Socket.io 的液相色谱仪前端控制系统，后端服务运行于 `http://localhost:5000/`。

---

## 目录结构

```
src/models/chromatograph/
├── api/                            # API 层
│   ├── axiosInstance.js            # Axios 实例 & 拦截器
│   ├── column.js                   # 柱子操作（润柱、冲洗）
│   ├── eluent_curve.js             # 洗脱曲线 & 梯度管理
│   ├── experiment.js               # 实验数据保存/查询/下载
│   ├── methods.js                  # 方法 CRUD
│   ├── settings.js                 # 储液瓶 & 收集瓶配置
│   ├── status.js                   # 设备状态 & 硬件控制
│   ├── task_demo.js                # 梯度演示任务
│   ├── tube.js                     # 试管操作（暂停/恢复）
│   └── xuanzheng.js                # 旋转阀控制
├── hooks/
│   ├── createDB.js                 # IndexedDB 写入 hook
│   └── useIndexedDB.js             # IndexedDB 读取 hook
├── pages/
│   ├── App.js                      # 主导航壳（底部 Tab 切换）
│   ├── config/
│   │   └── parameter_description.json  # 错误码 & 参数描述
│   ├── views/                      # 实验运行页
│   │   ├── index.js                # 核心实验界面
│   │   ├── buttonTube.js           # 试管选择网格
│   │   ├── taskTable.js            # 任务状态表格
│   │   └── stepFlow.js             # 多步骤工作流
│   ├── method/                     # 方法编辑页
│   │   ├── index.js                # 方法参数编辑器
│   │   └── buttonTube.js           # 方法专用试管选择
│   ├── historical/                 # 历史数据页
│   │   ├── index.js                # 历史列表 & 导出
│   │   └── hisLine.js              # D3 历史曲线图
│   ├── systemSet/                  # 设备监控页
│   │   ├── index.js                # 设备状态 & 硬件控制面板
│   │   ├── dynamicLine.js          # D3 梯度曲线可视化
│   │   └── notice.js               # 告警通知抽屉
│   └── systemSettings/             # 系统设置页
│       └── index.js                # 储液瓶名称 & 收集瓶容量
└── index.js                        # React 根入口
```

---

## 四大功能模块

### 1. 运行（views）

实验执行的核心界面。

- **实时曲线监控**：通过 Socket.io 接收设备数据，D3.js 绘制色谱曲线
- **试管网格选择**：按模块分组的 4×5 试管网格，支持范围选择、体积滑块
- **任务管理**：任务表格展示运行中/已完成的子任务，支持暂停/恢复
- **多步骤工作流**（StepFlow）：润柱 → 收集 → 保留 → 清洗
- **硬件控制**：泵操作、多通阀切换、进样阀、手动保持/切管、废液模式
- **状态持久化**：关键状态写入 `localStorage`（key: `chromatograph:experiment-state:v1`），刷新后自动恢复

### 2. 方法（method）

色谱方法的创建与管理。

- **参数配置**：采集时间、检测器波长、试管体积、总流速、蠕动泵参数
- **柱子平衡**：开关控制，可设置速度与润柱时间
- **洗脱模式**：
  - 等度洗脱（固定泵 A/B 比例）
  - 二元高压梯度（时间-泵A%-泵B%-流速 表格编辑）
- **清洗/收集列表**：按模块配置液量
- **方法 CRUD**：新建、保存、加载、删除、上传至设备
- **持久化**：IndexedDB 本地存储 + 远程 API 同步

### 3. 历史（historical）

实验数据的回顾与导出。

- **历史列表**：分页展示，卡片显示方法名、采集时间、起止时间
- **详情弹窗**：完整实验元数据、报警信息、曲线回放（D3 图表）、任务操作摘要
- **数据导出**：单条下载或批量导出至自定义文件夹

### 4. 设置

#### 设备监控（systemSet）

- 设备状态实时展示（泵、阀、传感器）
- 硬件手动控制：泵启停与方向、多通阀、膜片泵、电磁阀、高压泵
- 手动测试模式切换
- 告警/错误码中文翻译与展示
- 设备初始化

#### 系统设置（systemSettings）

- 储液瓶命名（泵 A 默认"水"、泵 B 默认"乙腈"）
- 收集瓶容量（快捷预设：5/10/15/20/30/50 mL，或自定义）
- localStorage + 远程 API 双重持久化

---

## 数据持久化策略

| 存储位置 | Key / Store | 用途 |
|----------|-------------|------|
| localStorage | `chromatograph:experiment-state:v1` | 运行页全量状态（试管、曲线、任务、方法等），防刷新丢失 |
| localStorage | `chromatograph:system-settings:v1` | 系统设置（泵名称、试管容量） |
| localStorage | `methodId` | 当前激活的方法 ID |
| localStorage | `uploadFlag` / `updateLineFlag` | 方法上传 / 曲线更新标记 |
| IndexedDB | `MyDatabase` → `method` | 方法完整定义的本地缓存 |

---

## API 概览

所有接口基于 `http://localhost:5000/`，通过 Axios 统一封装。

| 模块 | 前缀 | 核心能力 |
|------|------|----------|
| **eluent_curve** | `/eluent_curve/` | 梯度曲线增删改查、暂停/启动/终止、进样、切管、废液、峰检测 |
| **methods** | `/method/` | 方法 CRUD、设置当前方法、上传同步、色谱参数更新 |
| **status** | `/status/` | 设备状态读写、硬件控制（泵/阀/传感器）、手动测试模式 |
| **experiment** | `/experiment/` | 实验数据保存/查询/下载 |
| **column** | `/column/` | 润柱、冲洗启停 |
| **settings** | `/settings/` | 储液瓶 & ��集瓶配置 |
| **tubes** | `/tubes/` | 单管暂停/恢复 |

---

## 实时通信

通过 **Socket.io** 连接 `http://localhost:5000`，用于：

- 设备状态实时推送（泵速、压力、检测器信号）
- 任务执行进度更新
- 告警/错误事件通知

---

## 实验执行流程

```
选择方法 (Method) → 选择试管 (buttonTube) → 配置操作 (废弃/保留/清洗)
    → 启动实验 → Socket.io 实时数据 → StepFlow 多阶段控制
    → 任务完成 → 保存实验数据 → 历史页面回顾/导出
```

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React |
| UI 组件库 | Ant Design (antd) |
| 数据可视化 | D3.js |
| 实时通信 | Socket.io |
| HTTP 客户端 | Axios |
| 本地存储 | localStorage + IndexedDB |
| 工具库 | Lodash, Day.js |
