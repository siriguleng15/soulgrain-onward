# 参考案例的替代资料检索记录

记录日期：2026-10-30（Asia/Shanghai）。这是八个 Awwwards 地址访问失败后的补充尝试，不替代原访问记录。

本轮通过带浏览器 User-Agent 的标准 HTTPS 请求，尝试品牌候选入口，以及公开搜索服务中的作品与开发者检索。每次请求设置 7 秒超时；八个请求均在当前环境代理的 CONNECT 阶段返回 `Tunnel connection failed: 403 Forbidden`，没有取得目标网页或搜索结果 HTML。

| 尝试的资料入口 | 实际请求地址 | 结果 |
| --- | --- | --- |
| Flowers for Society 品牌候选入口 | <https://www.flowersforsociety.com/> | 代理 CONNECT 403；无可读内容 |
| Shopify Supply 品牌候选入口 | <https://supply.shopify.com/> | 代理 CONNECT 403；无可读内容 |
| Rouvenat 品牌候选入口 | <https://rouvenat.com/> | 代理 CONNECT 403；无可读内容 |
| Finely Crafted 开发者检索 | <https://www.google.com/search?q=%22Finely+Crafted%22+awwwards+developer> | 代理 CONNECT 403；未取得搜索结果 |
| Flowers for Society 开发者检索 | <https://www.bing.com/search?q=%22Flowers+for+Society%22+website+developer> | 代理 CONNECT 403；未取得搜索结果 |
| Chrono 服装交互开发者检索 | <https://duckduckgo.com/html/?q=Chrono+interactive+garments+website+developer> | 代理 CONNECT 403；未取得搜索结果 |
| CHANEL 品牌入口 | <https://www.chanel.com/> | 代理 CONNECT 403；无可读内容 |
| Lacoste 品牌入口 | <https://www.lacoste.com/> | 代理 CONNECT 403；无可读内容 |

其中“候选入口”仅指尝试访问的地址，**未验证它就是用户指定获奖作品的原站或当前演示地址**。品牌首页即使可以访问，也不能自动视为指定互动案例的证据。本轮没有取得搜索摘要、开发者说明、公开演示视频或可靠的第三方技术解析；因此没有新增关于这些作品技术栈、视觉品质或交互细节的断言。

访问限制发生在代理连接阶段，不能据此判断品牌网站或作品已经下线。没有通过其他域名代理或非公开渠道绕过访问控制，也没有下载第三方作品的模型、纹理、商标、视频或源码。

目前可核实的技术依据仍是项目已安装的 Three.js 源码，以及 Soulgrain 自己的真实浏览器运行、网格采样来源、镜头和触控测试。具体实现及视觉验收应阅读 [研究与运行说明](README.zh-CN.md)；前八个准确参考地址的记录见 [案例 1–4](REFERENCES-1-4.zh-CN.md) 与 [案例 5–8](REFERENCES-5-8.zh-CN.md)。
