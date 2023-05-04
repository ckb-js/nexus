# v0.0.19 (Thu May 04 2023)

#### 🔨 Breaking Minor Change

- Merge remote-tracking branch 'upstream/main' into ownershipProvider-sendTransaction-with-payFee ([@IronLu233](https://github.com/IronLu233))
- Merge remote-tracking branch 'upstream/main' into e2e-node-interaction ([@IronLu233](https://github.com/IronLu233))

#### 🧪 Tests

- feat: a ckb node wrapper in js [#239](https://github.com/ckb-js/nexus/pull/239) ([@IronLu233](https://github.com/IronLu233) [@homura](https://github.com/homura))
- chore: fix incorrect coverage in code cov [#269](https://github.com/ckb-js/nexus/pull/269) ([@homura](https://github.com/homura))

#### Authors: 2

- Iron Lu ([@IronLu233](https://github.com/IronLu233))
- Yonghui Lin ([@homura](https://github.com/homura))

---

# v0.0.15 (Thu Apr 27 2023)

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

- refactor(ownership-providers): merge with new provider ([@homura](https://github.com/homura))
- test(detect-ckb): eslint error since no floating promise ([@homura](https://github.com/homura))
- refactor(detect-ckb): customizable types of detected ckb ([@homura](https://github.com/homura))
- Merge remote-tracking branch 'origin/main' into detect-ckb ([@homura](https://github.com/homura))
- feat(detect-ckb): detecting injected ckb test cases [#250](https://github.com/ckb-js/nexus/pull/250) ([@pygman](https://github.com/pygman))
- chore(detect-ckb): consistent nexus pkg version ([@homura](https://github.com/homura))
- feat(detect-ckb): detecting injected ckb test cases ([@pygman](https://github.com/pygman))
- Merge remote-tracking branch 'ckb-js/main' into detect-ckb ([@homura](https://github.com/homura))
- feat(detect-ckb): a module for detecting injected ckb ([@homura](https://github.com/homura))

#### 🚀 Enhancement

- feat(detect-ckb): a module for detecting injected ckb [#249](https://github.com/ckb-js/nexus/pull/249) ([@homura](https://github.com/homura) [@pygman](https://github.com/pygman))

#### 🐛 Bug Fix

- fix(ownership-providers): inject witness and cellDeps auto [#251](https://github.com/ckb-js/nexus/pull/251) ([@homura](https://github.com/homura) [@zhangyouxin](https://github.com/zhangyouxin))

#### 🏠 Internal

- chore: example for using ownership provider in a dapp [#252](https://github.com/ckb-js/nexus/pull/252) ([@homura](https://github.com/homura))

#### 📝 Documentation

- docs: developer tutorial [#256](https://github.com/ckb-js/nexus/pull/256) ([@homura](https://github.com/homura))

#### 🔩 Dependency Updates

- chore(deps): update dependency @types/chrome to v0.0.233 [#245](https://github.com/ckb-js/nexus/pull/245) ([@renovate[bot]](https://github.com/renovate[bot]))

#### Authors: 4

- [@renovate[bot]](https://github.com/renovate[bot])
- pygman ([@pygman](https://github.com/pygman))
- Shinya ([@zhangyouxin](https://github.com/zhangyouxin))
- Yonghui Lin ([@homura](https://github.com/homura))
