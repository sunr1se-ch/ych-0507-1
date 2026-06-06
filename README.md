# 地下管廊渗漏监测看板

市政运维中心「地下管廊渗漏水导率与相邻检查井负荷」对比看板

## 功能特性

- **渗漏强度智能计算**：自动分析相邻采样数据，识别水导率与流量双升的渗漏风险
- **邻段对比分析**：同廊道内相邻管廊段的渗漏强度对比，辅助定位异常
- **多维度可视化**：
  - 各段平均渗漏强度柱状对比图
  - 本段与邻段强度散点对比图
  - 节点位置示意图（热力着色）
  - 数据明细表（支持排序、分页）
- **灵活筛选**：廊道多选、日期范围筛选
- **数据导入导出**：CSV格式导入新采样数据，导出当前筛选结果
- **Docker一键部署**：开箱即用

## 核心计算逻辑

### 渗漏强度计算
1. 对每段管廊按采样时间升序排列
2. 相邻两次采样，若**水导率与流量同时上升**：
   - `渗漏强度 = 水导率增量 ÷ 间隔天数`
3. 否则渗漏强度记为 0
4. 每段平均渗漏强度 = 所有相邻采样对渗漏强度的算术平均

### 邻段对比计算
1. 同廊道内按上游节点确定相邻关系
2. 每段取前后相邻两段的平均渗漏强度对比

## 技术栈

- **前端**：React 18 + TypeScript + Vite + TailwindCSS + Zustand + ECharts
- **后端**：Express + TypeScript
- **数据存储**：内存存储 + JSON持久化
- **容器化**：Docker + Docker Compose

## 快速开始

### Docker 一键运行

```bash
docker-compose up -d
```

访问 http://localhost:3000

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式（前后端同时启动）
npm run dev

# 前端开发
npm run client:dev

# 后端开发
npm run server:dev

# 构建
npm run build
```

## 项目结构

```
├── src/                          # 前端源码
│   ├── components/               # UI组件
│   │   ├── FilterBar.tsx         # 筛选栏
│   │   ├── StatCard.tsx          # 统计卡片
│   │   ├── BarChart.tsx          # 柱状对比图
│   │   ├── ScatterChart.tsx      # 散点对比图
│   │   ├── TopologyChart.tsx     # 节点拓扑图
│   │   ├── DataTable.tsx         # 数据表格
│   │   └── ImportModal.tsx       # 导入弹窗
│   ├── pages/
│   │   └── Dashboard.tsx         # 看板主页面
│   ├── store/
│   │   └── useDashboardStore.ts  # 状态管理
│   ├── utils/
│   │   ├── api.ts                # API请求
│   │   └── format.ts             # 格式化工具
│   └── types/
│       └── index.ts              # 类型定义
├── api/                          # 后端源码
│   ├── routes/
│   │   └── dashboard.ts          # API路由
│   ├── services/
│   │   ├── calculation.ts        # 计算逻辑
│   │   ├── dataManager.ts        # 数据管理
│   │   └── csvHandler.ts         # CSV处理
│   └── data/
│       ├── seed/                 # 种子数据
│       │   ├── segments.json     # 管廊段数据
│       │   └── samples.json      # 采样数据
│       └── store.json            # 持久化数据
├── shared/
│   └── types.ts                  # 共享类型
├── Dockerfile
└── docker-compose.yml
```

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/dashboard/corridors` | 获取廊道列表 |
| GET | `/api/dashboard/segments` | 获取管廊段列表 |
| POST | `/api/dashboard/analysis` | 计算渗漏分析结果 |
| GET | `/api/dashboard/export` | 导出分析结果CSV |
| POST | `/api/dashboard/import` | 导入采样数据CSV |
| GET | `/api/dashboard/sample-template` | 下载导入模板 |
| POST | `/api/dashboard/reset` | 重置为种子数据 |

## CSV导入格式

```csv
段号,采样时间,水导率,流量
GL-A-001,2025-03-01,175,60
GL-A-001,2025-03-11,190,68
```

## 数据说明

系统包含3条廊道共12段管廊的种子数据：
- 东线廊道A：5段（GL-A-001 ~ GL-A-005）
- 西线廊道B：4段（GL-B-001 ~ GL-B-004）
- 南线廊道C：3段（GL-C-001 ~ GL-C-003）

每段包含5次采样数据（2025-01-05 至 2025-02-15）。
