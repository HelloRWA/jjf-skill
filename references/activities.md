# AI 活动地图

处理 `activity_*` 工具时阅读本文。所有写入以 Token 绑定账号执行，不能传入 userId 代替他人操作。

## 读取

| 工具 | 用途 |
|---|---|
| `activity_list_map_places` | 按地点聚合公开活动，可按 `city` 过滤，通常覆盖未来 30 天已发布和进行中活动 |
| `activity_list_activities` | 分页读取公开活动，可按 `state`、`city` 过滤 |
| `activity_get_detail` | 传 `activityId`，读取详情、名额、报名、签到设置及当前账号权限 |
| `activity_list_mine` | 当前账号发起或管理的活动 |
| `activity_list_my_registrations` | 当前账号的报名记录与实付积分 |
| `activity_get_registration_contact` | 当前账号最近一次报名使用的姓名和手机号，用于预填 |

## 报名与取消

- `activity_register`：必填 `activityId`、`participantName`（1–40 字符）、`participantPhone`（11 位中国大陆手机号），可选 `shareCode`。
- 报名积分按活动设置扣除，0 积分活动不扣分。执行前确认活动、联系人和积分；积分以活动详情及服务端结果为准。
- `activity_cancel_registration`：传 `activityId`，只取消当前账号有效报名。主动取消不退积分，执行前必须明确这一影响。

## 发起与编辑

### `activity_create`

必填：

- 稳定的 `idempotencyKey`；同一逻辑创建的网络重试必须复用，不同活动使用新键。
- `startsAt`、`endsAt`：毫秒时间戳，开始晚于当前时间，结束晚于开始。
- `feePoints`：0 或 10 的整数倍。
- `capacity`：2–500 人。
- `location`：完整 `name`、`address`、`city`、`district`、`adcode`、`latitude`、`longitude`。

可选 `checkinRequired`、`themeTitle`、`themeDescription`、`themeContent`、`discountCode`。提交后进入管理员审核，不能把「已提交」说成「已发布」。主题海报二进制上传回 H5 完成。

### `activity_update`

传 `activityId` 及需要修改的字段，可传 `version` 做乐观锁。只能编辑当前账号发起且处于待审核或审核未通过状态的活动；先读取详情确认状态。

## 报名名单与助邀

- `activity_export_registrations`：仅活动发起人可用，返回姓名、手机号、状态和北京时间组成的 CSV 文本。视为敏感信息，不公开发送或写入无关服务。
- `activity_create_invitation`：发起人传 `activityId`、`subsidyPercent`（0–100）、`capacity`（1–100）和稳定 `idempotencyKey`，投入积分生成可多人使用的助邀码。执行前确认积分投入、补贴比例与人数。

## 现场签到与活动管理员

| 工具 | 使用者和用途 |
|---|---|
| `activity_get_checkin_qr` | 已报名参与者读取动态签到令牌；只在活动需要签到且处于有效窗口时使用 |
| `activity_scan_checkin` | 发起人或活动管理员传 `activityId` 和参与者动态 `token` 完成签到 |
| `activity_set_admin` | 发起人传 `activityId`、`registrationId`、`enabled`，设置或取消本活动已报名用户的管理员身份 |

签到令牌具有时效性，不要把旧令牌当作仍然有效。扫码签到后根据返回结果报告，不能绕过签到窗口或权限校验。

## 推荐工作流

1. 用户浏览活动时，先按城市/状态读取列表，再读取目标详情。
2. 用户报名时，核对活动未开始、名额和费用，确认联系人后调用报名工具。
3. 用户发起活动时，先整理完整时间、地点、人数和积分，再确认创建；保留幂等键直到获得明确结果。
4. 用户管理报名或签到时，必须通过详情中的当前账号权限确认其身份，不仅依赖用户自称。
