# v0.0.14 (Mon Apr 17 2023)

#### 🚀 Enhancement

- feat: badge to show how many notif window is pending [#216](https://github.com/ckb-js/nexus/pull/216) ([@zhangyouxin](https://github.com/zhangyouxin))

#### 🏎 Performance

- perf: support sign message in batch [#225](https://github.com/ckb-js/nexus/pull/225) ([@zhangyouxin](https://github.com/zhangyouxin))

#### 🏠 Internal

- chore: update webext-bridge to v6 [#209](https://github.com/ckb-js/nexus/pull/209) ([@zhangyouxin](https://github.com/zhangyouxin))

#### Authors: 1

- Shinya ([@zhangyouxin](https://github.com/zhangyouxin))

---

# v0.0.13 (Fri Apr 14 2023)

#### 🚀 Enhancement

- `@nexus-wallet/ownership-providers`
  - feat(ownership-providers): intro an accent color to inputs and buttons [#186](https://github.com/ckb-js/nexus/pull/186) ([@IronLu233](https://github.com/IronLu233))

#### 🔩 Dependency Updates

- fix(deps): update dependency awilix to v8.0.1 [#203](https://github.com/ckb-js/nexus/pull/203) ([@renovate[bot]](https://github.com/renovate[bot]))

#### Authors: 2

- [@renovate[bot]](https://github.com/renovate[bot])
- Iron Lu ([@IronLu233](https://github.com/IronLu233))

---

# v0.0.12 (Fri Apr 14 2023)

#### 🚀 Enhancement

- feat: serial notif windows to avoid confusion from multiple notif [#189](https://github.com/ckb-js/nexus/pull/189) ([@zhangyouxin](https://github.com/zhangyouxin))

#### 🏠 Internal

- chore: avoid canary for renovate pr [#212](https://github.com/ckb-js/nexus/pull/212) ([@homura](https://github.com/homura))
- `@nexus-wallet/ownership-providers`
  - chore: add eslint import plugin [#208](https://github.com/ckb-js/nexus/pull/208) ([@IronLu233](https://github.com/IronLu233))

#### Authors: 3

- Iron Lu ([@IronLu233](https://github.com/IronLu233))
- Shinya ([@zhangyouxin](https://github.com/zhangyouxin))
- Yonghui Lin ([@homura](https://github.com/homura))

---

# v0.0.11 (Thu Apr 13 2023)

#### 🚀 Enhancement

- `@nexus-wallet/ownership-providers`, `@nexus-wallet/protocol`, `@nexus-wallet/utils`
  - chore: publish modules to npm [#196](https://github.com/ckb-js/nexus/pull/196) ([@homura](https://github.com/homura))

#### 🐛 Bug Fix

- `@nexus-wallet/utils`
  - chore: bump manifest version in ci [#210](https://github.com/ckb-js/nexus/pull/210) ([@homura](https://github.com/homura))

#### 🏠 Internal

- test: e2e test scaffolding [#184](https://github.com/ckb-js/nexus/pull/184) ([@homura](https://github.com/homura))
- `@nexus-wallet/utils`
  - refactor: make utils flatten [#194](https://github.com/ckb-js/nexus/pull/194) ([@homura](https://github.com/homura))

#### 📝 Documentation

- docs: run with the local devnet [#145](https://github.com/ckb-js/nexus/pull/145) ([@zhangyouxin](https://github.com/zhangyouxin))

#### Authors: 2

- Shinya ([@zhangyouxin](https://github.com/zhangyouxin))
- Yonghui Lin ([@homura](https://github.com/homura))

---

# v0.0.10 (Mon Apr 10 2023)

#### 🔨 Breaking Minor Change

- feat: ownership provider to work with Lumos [#127](https://github.com/ckb-js/nexus/pull/127) ([@homura](https://github.com/homura) [@IronLu233](https://github.com/IronLu233))

#### 🐛 Bug Fix

- fix: getLiveCells returns specified change type cells [#183](https://github.com/ckb-js/nexus/pull/183) ([@zhangyouxin](https://github.com/zhangyouxin))
- feat(extension-chrome): optimize displaying amount of asset [#187](https://github.com/ckb-js/nexus/pull/187) ([@IronLu233](https://github.com/IronLu233))

#### Authors: 3

- Iron Lu ([@IronLu233](https://github.com/IronLu233))
- Shinya ([@zhangyouxin](https://github.com/zhangyouxin))
- Yonghui Lin ([@homura](https://github.com/homura))

---

# v0.0.9 (Tue Apr 04 2023)

#### 🐛 Bug Fix

- fix: UI bugs and improvements [#177](https://github.com/ckb-js/nexus/pull/177) ([@IronLu233](https://github.com/IronLu233))

#### Authors: 1

- Iron Lu ([@IronLu233](https://github.com/IronLu233))

---

# v0.0.8 (Fri Mar 31 2023)

#### 🚀 Enhancement

- feat: supported get blockchain info rpc [#168](https://github.com/ckb-js/nexus/pull/168) ([@homura](https://github.com/homura))

#### 🐛 Bug Fix

- chore(extension-chrome): remove unnecessary accessible [#173](https://github.com/ckb-js/nexus/pull/173) ([@homura](https://github.com/homura))
- fix: return cells with invalid lock args [#171](https://github.com/ckb-js/nexus/pull/171) ([@zhangyouxin](https://github.com/zhangyouxin))
- fix(extension-chrome): enable for http and local site [#174](https://github.com/ckb-js/nexus/pull/174) ([@homura](https://github.com/homura))

#### 📝 Documentation

- docs: new readme [#175](https://github.com/ckb-js/nexus/pull/175) ([@zhangyouxin](https://github.com/zhangyouxin))

#### Authors: 2

- Shinya ([@zhangyouxin](https://github.com/zhangyouxin))
- Yonghui Lin ([@homura](https://github.com/homura))

---

# v0.0.7 (Tue Mar 28 2023)

#### 🐛 Bug Fix

- fix: retry not work in backend [#167](https://github.com/ckb-js/nexus/pull/167) ([@zhangyouxin](https://github.com/zhangyouxin))

#### Authors: 1

- Shinya ([@zhangyouxin](https://github.com/zhangyouxin))

---

# v0.0.6 (Tue Mar 28 2023)

#### 🐛 Bug Fix

- feat(extension-chrome): Use Chrome extension favicon API for whitelist and grant [#122](https://github.com/ckb-js/nexus/pull/122) ([@IronLu233](https://github.com/IronLu233))

#### Authors: 1

- Iron Lu ([@IronLu233](https://github.com/IronLu233))

---

# v0.0.5 (Tue Mar 28 2023)

#### 🐛 Bug Fix

- fix: connect status is always connected [#157](https://github.com/ckb-js/nexus/pull/157) ([@IronLu233](https://github.com/IronLu233))

#### 🏠 Internal

- refactor: disable unsafe any access [#138](https://github.com/ckb-js/nexus/pull/138) ([@IronLu233](https://github.com/IronLu233))

#### 📝 Documentation

- docs: faq [#150](https://github.com/ckb-js/nexus/pull/150) ([@homura](https://github.com/homura))

#### Authors: 2

- Iron Lu ([@IronLu233](https://github.com/IronLu233))
- Yonghui Lin ([@homura](https://github.com/homura))

---

# v0.0.4 (Mon Mar 27 2023)

#### 🔨 Breaking Minor Change

- feat: sign data with a magic prefix for security [#139](https://github.com/ckb-js/nexus/pull/139) ([@zhangyouxin](https://github.com/zhangyouxin))

#### 🏠 Internal

- chore: prevent canary release in PR from forked repo [#147](https://github.com/ckb-js/nexus/pull/147) ([@homura](https://github.com/homura))

#### Authors: 2

- Shinya ([@zhangyouxin](https://github.com/zhangyouxin))
- Yonghui Lin ([@homura](https://github.com/homura))

---

# v0.0.3 (Thu Mar 23 2023)

#### 🐛 Bug Fix

- fix(extension-chrome): fix typo and whitelist UI overflow [#142](https://github.com/ckb-js/nexus/pull/142) ([@IronLu233](https://github.com/IronLu233))

#### Authors: 1

- Iron Lu ([@IronLu233](https://github.com/IronLu233))

---

# v0.0.2 (Thu Mar 23 2023)

#### 🔨 Breaking Minor Change

- feat(extension-chrome): validate RPC methods input parameters [#110](https://github.com/ckb-js/nexus/pull/110) ([@IronLu233](https://github.com/IronLu233))

#### 🚀 Enhancement

- feat: a protocol pkg to standardize communication [#126](https://github.com/ckb-js/nexus/pull/126) ([@homura](https://github.com/homura))

#### 🏠 Internal

- chore: bypass protect branch [#140](https://github.com/ckb-js/nexus/pull/140) ([@homura](https://github.com/homura))
- chore: auto build when pr or push [#136](https://github.com/ckb-js/nexus/pull/136) ([@homura](https://github.com/homura))

#### Authors: 2

- Iron Lu ([@IronLu233](https://github.com/IronLu233))
- Yonghui Lin ([@homura](https://github.com/homura))
