# v0.0.19 (Thu May 04 2023)

#### 🔨 Breaking Minor Change

- Merge remote-tracking branch 'upstream/main' into ownershipProvider-sendTransaction-with-payFee ([@IronLu233](https://github.com/IronLu233))
- refactor: optimize Map structures ([@IronLu233](https://github.com/IronLu233))
- refactor: use extended map for clearify code ([@IronLu233](https://github.com/IronLu233))
- test: make txWithFee calculation more clear ([@IronLu233](https://github.com/IronLu233))
- fix: logic bug ([@IronLu233](https://github.com/IronLu233))
- Merge remote-tracking branch 'upstream/main' into e2e-node-interaction ([@IronLu233](https://github.com/IronLu233))
- test: modify code for coverage ([@IronLu233](https://github.com/IronLu233))
- test: add unit test for send transaction ([@IronLu233](https://github.com/IronLu233))
- fix: filter type script cell when pay fee ([@IronLu233](https://github.com/IronLu233))
- refactor: Top-to-bottom implementation ([@IronLu233](https://github.com/IronLu233))
- feat(ownership-providers): support payFee and signTransaction in send transaction ([@IronLu233](https://github.com/IronLu233))
- fix(ownership-provider): support unsigned transaction ([@IronLu233](https://github.com/IronLu233))
- fix(ownership-provider): add method `isOwnedByWallet` ([@IronLu233](https://github.com/IronLu233))

#### 🚀 Enhancement

- feat(ownership-provider): support `payFee` and `signTransaction` in `sendTransaction` [#272](https://github.com/ckb-js/nexus/pull/272) ([@IronLu233](https://github.com/IronLu233))

#### 🧪 Tests

- feat: a ckb node wrapper in js [#239](https://github.com/ckb-js/nexus/pull/239) ([@IronLu233](https://github.com/IronLu233) [@homura](https://github.com/homura))
- chore: fix incorrect coverage in code cov [#269](https://github.com/ckb-js/nexus/pull/269) ([@homura](https://github.com/homura))

#### Authors: 2

- Iron Lu ([@IronLu233](https://github.com/IronLu233))
- Yonghui Lin ([@homura](https://github.com/homura))

---

# v0.0.17 (Thu Apr 27 2023)

### Release Notes

#### feat(detect-ckb): a module for detecting injected ckb ([#249](https://github.com/ckb-js/nexus/pull/249))

Added a module for detecting `ckb` object in `window`

```ts
import { detectCkb } from '@nexus-wallet/detect-ckb';

// will detect if the `ckb` object is injected to window
// an error will be thrown after more than 3s of detection
const ckb = await detectCkb({ timeout: 3000 });
```

---

#### 🔨 Breaking Minor Change

- revert(ownership-provider): revert payFee and sign ([@IronLu233](https://github.com/IronLu233))
- feat(ownership-provider): Ownership provider send transaction ([@IronLu233](https://github.com/IronLu233))
- refactor(ownership-providers): merge with new provider ([@homura](https://github.com/homura))
- test: rm unused cases ([@homura](https://github.com/homura))
- refactor: rm unnecessary code ([@homura](https://github.com/homura))
- feat: remove witness from existing input lock ([@zhangyouxin](https://github.com/zhangyouxin))
- Merge remote-tracking branch 'origin/main' into detect-ckb ([@homura](https://github.com/homura))
- test(ownership-providers): update failed test cases ([@homura](https://github.com/homura))
- fix(ownership-providers): inject witness and cellDeps auto ([@homura](https://github.com/homura))
- Merge remote-tracking branch 'ckb-js/main' into detect-ckb ([@homura](https://github.com/homura))

#### 🚀 Enhancement

- feat(ownership-provider): supported send transaction [#255](https://github.com/ckb-js/nexus/pull/255) ([@IronLu233](https://github.com/IronLu233))
- feat(detect-ckb): a module for detecting injected ckb [#249](https://github.com/ckb-js/nexus/pull/249) ([@homura](https://github.com/homura) [@pygman](https://github.com/pygman))

#### 🐛 Bug Fix

- fix(ownership-providers): inject witness and cellDeps auto [#251](https://github.com/ckb-js/nexus/pull/251) ([@homura](https://github.com/homura) [@zhangyouxin](https://github.com/zhangyouxin))

#### 📝 Documentation

- docs: developer tutorial [#256](https://github.com/ckb-js/nexus/pull/256) ([@homura](https://github.com/homura))

#### 🔩 Dependency Updates

- chore(deps): update dependency @types/chrome to v0.0.233 [#245](https://github.com/ckb-js/nexus/pull/245) ([@renovate[bot]](https://github.com/renovate[bot]))
- chore(deps): update dependency prettier to v2.8.8 [#257](https://github.com/ckb-js/nexus/pull/257) ([@renovate[bot]](https://github.com/renovate[bot]))
- chore(deps): update jest monorepo [#71](https://github.com/ckb-js/nexus/pull/71) ([@renovate[bot]](https://github.com/renovate[bot]))

#### Authors: 5

- [@renovate[bot]](https://github.com/renovate[bot])
- Iron Lu ([@IronLu233](https://github.com/IronLu233))
- pygman ([@pygman](https://github.com/pygman))
- Shinya ([@zhangyouxin](https://github.com/zhangyouxin))
- Yonghui Lin ([@homura](https://github.com/homura))

---

# v0.0.16 (Tue Apr 25 2023)

#### 🔨 Breaking Minor Change

- chore: update dependencies ([@homura](https://github.com/homura))
- Merge branch 'main' into testkit ([@homura](https://github.com/homura))

#### 📝 Documentation

- docs: nexus works with custody unlocking [#152](https://github.com/ckb-js/nexus/pull/152) ([@homura](https://github.com/homura))

#### 🔩 Dependency Updates

- chore(deps): update dependency @auto-it/upload-assets to v10.45.0 [#241](https://github.com/ckb-js/nexus/pull/241) ([@renovate[bot]](https://github.com/renovate[bot]))
- fix(deps): update dependency zustand to v4.3.7 [#230](https://github.com/ckb-js/nexus/pull/230) ([@renovate[bot]](https://github.com/renovate[bot]))

#### Authors: 2

- [@renovate[bot]](https://github.com/renovate[bot])
- Yonghui Lin ([@homura](https://github.com/homura))

---

# v0.0.13 (Fri Apr 14 2023)

#### 🔨 Breaking Minor Change

- Merge remote-tracking branch 'upstream/main' into ui-refine ([@IronLu233](https://github.com/IronLu233))

#### 🚀 Enhancement

- feat(ownership-providers): intro an accent color to inputs and buttons [#186](https://github.com/ckb-js/nexus/pull/186) ([@IronLu233](https://github.com/IronLu233))

#### 🔩 Dependency Updates

- fix(deps): update dependency awilix to v8.0.1 [#203](https://github.com/ckb-js/nexus/pull/203) ([@renovate[bot]](https://github.com/renovate[bot]))

#### Authors: 2

- [@renovate[bot]](https://github.com/renovate[bot])
- Iron Lu ([@IronLu233](https://github.com/IronLu233))

---

# v0.0.12 (Fri Apr 14 2023)

#### 🔨 Breaking Minor Change

- Merge remote-tracking branch 'upstream/main' into notification-manager ([@zhangyouxin](https://github.com/zhangyouxin))
- Merge branch 'main' of https://github.com/ckb-js/nexus into no-extraneous-dependencies ([@IronLu233](https://github.com/IronLu233))
- chore: add eslint import plugin ([@IronLu233](https://github.com/IronLu233))

#### 🏠 Internal

- chore: add eslint import plugin [#208](https://github.com/ckb-js/nexus/pull/208) ([@IronLu233](https://github.com/IronLu233))

#### Authors: 2

- Iron Lu ([@IronLu233](https://github.com/IronLu233))
- Shinya ([@zhangyouxin](https://github.com/zhangyouxin))

---

# v0.0.11 (Thu Apr 13 2023)

#### 🔨 Breaking Minor Change

- docs: readme for npm ([@homura](https://github.com/homura))
- Merge remote-tracking branch 'ckb-js/main' into lerna-publish ([@homura](https://github.com/homura))
- chore: bump version ([@homura](https://github.com/homura))
- fix(ownership-provider): build failed since cannot find entry ([@homura](https://github.com/homura))
- chore: unnecessary lumos submodule ([@homura](https://github.com/homura))
- chore: lerna to publish modules ([@homura](https://github.com/homura))
- refactor(ownership-providers): reduce dependencies by replacing lodash equal ([@homura](https://github.com/homura))

#### 🚀 Enhancement

- chore: publish modules to npm [#196](https://github.com/ckb-js/nexus/pull/196) ([@homura](https://github.com/homura))

#### 🏠 Internal

- test: e2e test scaffolding [#184](https://github.com/ckb-js/nexus/pull/184) ([@homura](https://github.com/homura))

#### 📝 Documentation

- docs: run with the local devnet [#145](https://github.com/ckb-js/nexus/pull/145) ([@zhangyouxin](https://github.com/zhangyouxin))

#### Authors: 2

- Shinya ([@zhangyouxin](https://github.com/zhangyouxin))
- Yonghui Lin ([@homura](https://github.com/homura))
