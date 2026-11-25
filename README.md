# JJF Skill

让支持 Streamable HTTP MCP 的 Agent 以用户本人的 JJF 账号使用「AI 孵化器」和「AI 活动地图」。

## 安装

安装到当前用户的共享 Skills 目录：

```bash
git clone https://github.com/HelloRWA/jjf-skill.git ~/.agents/skills/jjf-skill
```

也可克隆到项目的 `.agents/skills/jjf-skill`。新会话会发现根目录的 `SKILL.md`。

## 配置 MCP

1. 在 JJF H5 打开「我的 → Agent 接入（MCP）」，生成自己的用户级 Token。重新生成会使旧 Token 失效。
2. 参考仓库的 [`mcp.json`](mcp.json)，在宿主 MCP 配置中注册 `jjf-platform`，把 `JJF_MCP_TOKEN` 作为本机私密环境变量注入。
3. 如果宿主不展开 `${JJF_MCP_TOKEN}`，使用该宿主的私密变量或本机配置机制；不要把真实 Token 写进此仓库、聊天、日志或公开文档。

连接的是真实账号。工具会继承积分、所有权、名额、审核与管理员权限边界；支付、图片上传、退款和平台审核仍需回 H5 或管理台。

详细使用规则见 [`SKILL.md`](SKILL.md)，工具的最终名称和参数 schema 以 MCP `tools/list` 为准。
