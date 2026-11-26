# JJF Skill

让支持 Streamable HTTP MCP 的 Agent 通过公开城市索引发现城市、区县、景点、文旅线路与赛事接待 Skill，并以用户本人的 JJF 账号使用「AI 孵化器」和「AI 活动地图」。

## 安装

安装到当前用户的共享 Skills 目录：

```bash
git clone https://github.com/HelloRWA/jjf-skill.git ~/.agents/skills/jjf-skill
```

也可克隆到项目的 `.agents/skills/jjf-skill`。新会话会发现根目录的 `SKILL.md`。

## 配置 MCP

仓库的 [`mcp.json`](mcp.json) 包含两个独立服务，可按需要在宿主 MCP 配置中注册。

### 公共城市索引：`jjf-city`

- 地址：`https://env-00jy6kl6893u.dev-hz.cloudbasefunction.cn/city-mcp`。
- 这是公开只读 MCP，**无需 JJF 登录或 JJF Token**，配置中没有 `Authorization`。只使用城市发现、阅读和入驻指引时，不需要生成 JJF Token。
- 城市搜索、同名候选选择、目标 Skill 接管与返回规则见 [`references/cities.md`](references/cities.md)。不要把平台 Token 传给城市 MCP 或写入 Agent 接管提示词。

### 用户级平台：`jjf-platform`

1. 在 JJF H5 打开「我的 → Agent 接入（MCP）」，生成自己的用户级 Token。重新生成会使旧 Token 失效。
2. 在宿主 MCP 配置中注册 `jjf-platform`，把 `JJF_MCP_TOKEN` 作为本机私密环境变量注入；**私有账号数据和平台读写仍需要该用户 Token**。
3. 如果宿主不展开 `${JJF_MCP_TOKEN}`，使用该宿主的私密变量或本机配置机制；不要把真实 Token 写进此仓库、聊天、日志或公开文档。

平台连接的是真实账号。工具会继承积分、所有权、名额、审核与管理员权限边界；支付、图片上传、退款和平台审核仍需回 H5 或管理台。公共城市 MCP 不能代替平台认证或访问这些数据。

## 城市 Skill 接管方式

接管是用户明确选择目标、查看维护者/版本/来源并再次确认后的**逻辑路由**：索引读取目标 Skill，并把后续回答限制在其声明的 scope 内。不假设宿主必然支持动态安装或加载远程 Skill，也不声称已经安装或运行它；宿主不能加载时，可提供不含 Token 的外部 Agent 接管提示词。

详细使用规则见 [`SKILL.md`](SKILL.md)，两个服务的最终工具名称和参数 schema 分别以各自 MCP `tools/list` 为准。

## 测试

```bash
npm test
```

测试使用 Node.js 内置 `node:test`，无需安装第三方依赖。
