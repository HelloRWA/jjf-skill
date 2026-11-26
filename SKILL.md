---
name: jjf-skill
description: 通过 JJF 孵化实验室 MCP 查询和操作当前账号的 AI 孵化器与 AI 活动地图，并通过公开只读城市索引发现城市、区县、景点、文旅线路与赛事接待 Skill，在用户选择后进行逻辑接管或返回索引。用于空间项目、认领与转让、邀请码入驻、活动报名与签到，以及城市介绍、目的地或同名地点搜索、旅游规划、武汉、数命 SPU 与 SAIG 等请求；公共 jjf-city 无需 Token，jjf-platform 仍需用户级 Token，支付、图片上传、退款与平台审核不在此 Skill 内完成。
---

# JJF 孵化实验室

本 Skill 使用两个边界独立的远程 MCP：`jjf-city` 提供公开城市内容的只读索引，`jjf-platform` 以 Token 绑定的 JJF 账号执行真实读取和写入。平台操作不是演示环境，也不能选择或传入其他用户 ID。

## 连接检查

### 公共城市索引

- 服务名：`jjf-city`；MCP 地址：`https://env-00jy6kl6893u.dev-hz.cloudbasefunction.cn/city-mcp`。
- Transport：Streamable HTTP；公开只读，无需 JJF 登录、用户 Token 或 `Authorization`。
- 城市、区县、景点、目的地、文旅线路与赛事接待请求按 [references/cities.md](references/cities.md) 处理，不得把 `jjf-platform` 的 Token 转发给城市 MCP。

### 用户级平台

- 服务名：`jjf-platform`；MCP 地址：`https://env-00jy6kl6893u.dev-hz.cloudbasefunction.cn/platform-mcp`。
- Transport：Streamable HTTP；认证：`Authorization: Bearer <用户级 Token>`。
- 仓库中的 `mcp.json` 使用 `${JJF_MCP_TOKEN}` 占位符。用户需要在 JJF H5「我的 → Agent 接入（MCP）」生成自己的 Token，并按宿主方式注入本机私密配置。
- 不要要求用户把 Token 粘贴到聊天中，不要回显、记录或提交 Token。工具不可用或认证失效时，引导用户重新生成接入提示词，不要尝试其他账号或绕过登录。
- 两个服务均以各自 MCP `tools/list` 返回的名称和 inputSchema 为最终接口依据；本 Skill 的参考文档说明业务规则与推荐工作流。

## 使用流程

1. 判断请求属于城市索引、孵化空间还是活动，并只读取对应参考：
   - `city_*`、城市、区县、景点、目的地、文旅、旅游线路、赛事接待、武汉、数命 SPU 或 SAIG → [references/cities.md](references/cities.md)。城市发现必须调用 `city_search`，不能凭记忆猜测入驻状态；同名歧义、用户显式选择、逻辑接管与返回均按该参考执行。
   - `ad_grid_*`、孵化空间、空间项目、认领、挂牌、空间邀请码 → [references/incubator.md](references/incubator.md)。
   - `activity_*`、活动地图、活动报名、发起活动、签到、助邀码 → [references/activities.md](references/activities.md)。
2. 写入前先读取目标最新状态与当前账号权限。不要仅凭历史对话推断归属、价格、名额、状态或可操作权限。
3. 明确对象、费用和影响。除用户本轮已明确要求该确切动作外，先确认以下操作：
   - 扣积分、创建订单、挂牌或认领资产、使用邀请码入驻；
   - 修改公开展示内容，尤其是管理员修改他人空间；
   - 生成或作废邀请码、取消报名/订单/挂牌、清空项目或默认展示。
4. 按工具 schema 调用。写入后检查 `structuredContent` 和实际业务状态，再报告结果；订单创建、支付待完成、活动待审核等中间状态不能说成最终成功。
5. 需要 H5 的步骤明确交给用户完成，并说明当前已完成到哪一步。

## 写入与安全边界

- 所有 `jjf-platform` 账号操作只作用于 Token 绑定账号；`jjf-city` 不绑定账号，也不执行写入。不能提升权限、读取无权访问的数据、伪造支付/审核/签到结果，或绕过所有权、名额、积分、状态机与时间窗口。
- 有 `idempotencyKey` / `clientRequestId` 的网络重试必须复用原键；新的逻辑操作使用新键。无幂等键的操作按对应参考文档先查询再决定是否重试。
- `UNAUTHORIZED`、`FORBIDDEN`、`MCP_TOKEN_INVALID`、`TOKEN_EXPIRED` 等错误不能当成业务成功。权限不足时停止，不退而尝试其他身份。
- 手机号、报名 CSV、Token、订单与资产信息只提供给有权查看的当前用户，不写入公开文档或无关服务。
- MCP 不支持支付、二进制图片/海报上传、退款审核、商家入驻或平台审核台；这些步骤回 JJF H5 或管理台完成。
- 空间与活动价格、积分和状态以实时读取及服务端校验为准，不承诺流量、升值、收益或投资回报。
