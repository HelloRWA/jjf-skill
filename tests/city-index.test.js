import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const rootSkill = read('SKILL.md');
const cities = read('references/cities.md');
const readme = read('README.md');
const mcp = JSON.parse(read('mcp.json'));

const cityTools = [
  'city_get_detail',
  'city_get_onboarding',
  'city_get_overview',
  'city_get_reference',
  'city_get_skill',
  'city_search',
];

test('jjf-city uses the designed public URL without credentials', () => {
  assert.deepEqual(mcp.mcpServers['jjf-city'], {
    type: 'streamable-http',
    url: 'https://env-00jy6kl6893u.dev-hz.cloudbasefunction.cn/city-mcp',
  });
  assert.equal(Object.hasOwn(mcp.mcpServers['jjf-city'], 'headers'), false);
  assert.doesNotMatch(JSON.stringify(mcp.mcpServers['jjf-city']), /Authorization|Token/i);
  assert.equal(
    mcp.mcpServers['jjf-platform'].headers.Authorization,
    'Bearer ${JJF_MCP_TOKEN}',
  );
  assert.match(cities, /公开只读，无需 JJF 登录、JJF 用户 Token 或 `Authorization`/);
  assert.match(readme, /无需 JJF 登录或 JJF Token/);
  assert.match(readme, /私有账号数据和平台读写仍需要该用户 Token/);
});

test('city reference documents exactly the six public read-only tools', () => {
  const documentedTools = new Set(
    [...cities.matchAll(/`(city_[a-z_]+)`/g)].map((match) => match[1]),
  );
  assert.deepEqual([...documentedTools].sort(), cityTools);
});

test('root skill exposes city triggers and routes to the city reference', () => {
  const description = rootSkill.match(/^description: (.+)$/m)?.[1] ?? '';
  for (const trigger of ['城市', '区县', '景点', '旅游规划', 'SPU', 'SAIG']) {
    assert.ok(description.includes(trigger), `description missing trigger: ${trigger}`);
  }
  assert.match(rootSkill, /references\/cities\.md/);
  assert.match(rootSkill, /城市发现必须调用 `city_search`/);
});

test('four-step discovery, selection, takeover and return workflow is explicit', () => {
  assert.match(cities, /发现 → 用户选择 → 目标 Skill 接管 → 返回索引/);
  const steps = ['### 1. 发现', '### 2. 用户选择', '### 3. 目标 Skill 接管', '### 4. 返回索引'];
  const positions = steps.map((step) => {
    const position = cities.indexOf(step);
    assert.notEqual(position, -1, `missing workflow step: ${step}`);
    return position;
  });
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.match(cities, /不能用记忆或历史对话代替本次已发布状态查询/);
  assert.match(cities, /不得伪造附近实体、Skill、维护者或来源/);
});

test('selection and takeover require disclosure, confirmation, scope and sources', () => {
  for (const contract of [
    '同名城市、区县或景点',
    '等待用户明确选择',
    '维护者、版本和来源',
    '`activeCitySkillId = <所选 entityId>`',
    '用户确认后的逻辑路由',
    '`scope.canAnswer`',
    '`scope.mustHandoff`',
    '`checkedAt`',
    '需以官方最新信息为准',
  ]) {
    assert.ok(cities.includes(contract), `missing takeover contract: ${contract}`);
  }
  assert.match(cities, /不得声称已经动态安装/);
});

test('return rules clear active state and reroute every exit path', () => {
  const returnSection = cities.split('### 4. 返回索引')[1].split('## 安全与 Token 边界')[0];
  for (const contract of [
    '清除 `activeCitySkillId`',
    '用户切换目的地、城市、区县或景点',
    '重新调用 `city_search`',
    '用户要求“返回索引”',
    '问题超出 `scope.canAnswer`，或命中 `scope.mustHandoff`',
    '回根 `SKILL.md` 重新分类',
  ]) {
    assert.ok(returnSection.includes(contract), `missing return rule: ${contract}`);
  }
});

test('third-party MCP and platform credentials stay outside public routing', () => {
  assert.match(cities, /绝不自动安装、自动连接或调用贡献者声明的第三方 MCP/);
  assert.match(cities, /绝不向用户索要、代收或读取其密钥/);
  assert.match(cities, /不得转而索要 JJF Token/);
  assert.match(cities, /仍只能走 `jjf-platform`/);
  assert.match(cities, /公共城市 MCP 不能用来绕过这些边界/);
});
