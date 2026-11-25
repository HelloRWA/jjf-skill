# AI 孵化器（孵化空间）

处理 `ad_grid_*` 工具时阅读本文。代码中的 `ad`、`cell` 是内部命名；对用户使用「孵化空间」「项目」「认领」「默认展示」。

## 核心规则

- 一级空间 ID 为 `p001`–`p100`，每个一级空间含 100 个二级空间，如 `p001-s001`。
- 一级空间预售价 10,000 元，使用权一年；二级空间预售价 100 元，使用权一个自然月。均不自动续费，实时价格以读取结果为准。
- 购买他人挂牌空间只获得剩余使用期，不重置到期时间。挂牌价单位为元，字符串格式，最多两位小数。
- 邀请码仅适用于所属一级分区下的空闲二级空间，免费获得一个自然月使用权。邀请空间不可挂牌转让，到期后项目自动下架。
- 图片与链接仅接受 HTTPS。MCP 不上传图片；新图片需要用户先在 H5 上传或提供已有公网 HTTPS 地址。
- 读取结果若含 `ad.imageFileId`，编辑该项目或默认展示时应把 `imageFileId` 与当前 `imageUrl` 一起原样带回。否则可能只保存会过期的临时图片 URL。

## 工具与常用参数

### 读取

| 工具 | 用法 |
|---|---|
| `ad_grid_get_board` | `level=1` 读取一级 10×10 沙盘；`level=2` 加 `parentId` 读取该分区 100 个二级空间 |
| `ad_grid_get_cell` | 传 `cellId`，读取项目、到期时间、价格、归属与当前账号权限 |
| `ad_grid_get_my_portfolio` | 读取当前账号持有的空间、挂牌状态和结算台账 |

### 当前用户写入

| 工具 | 必填参数与注意事项 |
|---|---|
| `ad_grid_save_ad` | `cellId`、`title`、`imageUrl`；可传 `description`、`linkUrl`、`imageFileId`。先确认 `isMine` |
| `ad_grid_set_listing` | `cellId`、`priceYuan`。邀请空间不能挂牌，买家不获得新增使用期 |
| `ad_grid_cancel_listing` | `cellId`；已有买家结算时可能被拒绝 |
| `ad_grid_create_purchase_order` | `cellId`、稳定的 `clientRequestId`。创建后预留 15 分钟，支付仍需 H5 |
| `ad_grid_get_purchase_order_status` | `orderId`；读取订单、支付尝试、预留和履约状态 |
| `ad_grid_cancel_purchase_order` | `orderId`；只能取消当前账号未支付订单 |
| `ad_grid_redeem_invite` | 8 位 `code`、二级 `cellId`。相同账号、邀请码和空间重复调用保持幂等 |

### 平台管理员工具

非管理员调用会返回 `FORBIDDEN`，不要重试或换身份绕过。

| 工具 | 用途 |
|---|---|
| `ad_grid_admin_save_cell_ad` | 编辑任意已生效空间的当前项目；参数与项目保存一致。不得改变归属、期限、挂牌、订单或结算字段 |
| `ad_grid_admin_clear_cell_ad` | 传 `cellId`，清空已生效空间当前项目，不改变资产状态 |
| `ad_grid_admin_get_defaults` | 读取全局默认展示；传 `cellId` 可同时读取单格默认展示 |
| `ad_grid_admin_save_global_default` | 保存未售空间的全局默认展示 |
| `ad_grid_admin_clear_global_default` | 清除全局默认展示 |
| `ad_grid_admin_save_cell_default` | 保存指定空间的单格默认展示，优先于全局默认 |
| `ad_grid_admin_clear_cell_default` | 清除指定空间的单格默认展示 |
| `ad_grid_admin_create_invites` | 传一级 `parentId` 和 `count`（1–20），生成单次邀请码 |
| `ad_grid_admin_list_invites` | 传一级 `parentId`，可选 `status=all/active/redeemed/revoked`，最多返回最近 200 条 |
| `ad_grid_admin_revoke_invite` | 传列表结果的 `inviteId`，作废未使用邀请码；不是传 8 位邀请码 |

已生效空间展示当前项目；未售空间才按「单格默认 → 全局默认」展示。需要改未售空间内容时使用默认展示工具，不要使用当前项目编辑工具。

## 推荐工作流

### 布置或修改项目

1. `ad_grid_get_cell` 读取最新项目与权限。
2. 普通用户确认 `isMine=true`；管理员只有确需代管时才使用管理员工具。
3. 向用户确认目标空间和公开内容。
4. 保存时保留未修改字段；已有云图片必须保留 `imageFileId`。
5. 重新读取或根据返回的 `cell` 核对结果。

### 认领或购买空间

1. 读取单格，核对 `canPurchase`、级别、`priceCent`、挂牌状态和到期时间。
2. 向用户确认空间、金额及获得的使用期。
3. 创建订单并保留 `clientRequestId`。网络重试复用同一个键。
4. 明确告知「订单已创建，尚待 H5 支付」，不要称为已购买。
5. 用户完成支付后查询订单状态；未支付才可取消订单。

### 邀请码入驻

1. 读取目标一级分区及其二级空间，确认目标空间空闲且属于该分区。
2. 确认用户使用该邀请码认领指定空间。
3. 调用 `ad_grid_redeem_invite`，返回成功后核对 `acquisitionKind=invite` 与到期时间。

### 管理员生成邀请码

`ad_grid_admin_create_invites` 没有幂等键。网络结果不明时，先调用 `ad_grid_admin_list_invites` 核对是否已生成，不要直接重复调用。已使用邀请码不能作废；作废操作需要列表中的 `inviteId`。
