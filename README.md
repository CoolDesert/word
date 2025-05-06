# 项目运行文档

## 项目简介
这是一个简单的 Web 项目，包含 HTML、CSS、JavaScript 文件以及一个 Node.js 服务器。项目中还包含一些图片资源和一个单词处理模块。

## 文件结构
- `index.html`: 主页面文件。
- `style.css`: 样式文件。
- `script.js`: 前端 JavaScript 文件。
- `server.js`: Node.js 服务器文件。
- `words.js`: 单词处理模块。
- `package.json`: 项目依赖配置文件。
- `mario_happy.jpeg`, `mario_sad.jpeg`, `mario.jpeg`: 图片资源。

## 环境要求
- Node.js (建议版本: 16.x 或更高)
- npm (Node.js 包管理工具)

## 安装依赖
在项目根目录下运行以下命令安装依赖：

```bash
npm install
```

## 启动项目
运行以下命令启动服务器：

```bash
node server.js
```

服务器启动后，可以在浏览器中访问 `http://localhost:3000` 查看项目。

## 注意事项
- 确保 `node_modules` 文件夹已被正确安装。
- 如果需要修改端口号，请编辑 `server.js` 文件中的相关配置。

## 贡献
欢迎提交 issue 或 pull request 来改进此项目。