## Purpose Field for Nexus

## BIP-43

The [BIP-43][BIP-43] introduced the concept of purpose field, which is used to indicate the purpose for a derivation path. BIPs reserved the codes from 1 to 10000, and SLIPs reserved the code from 10001' to 19999'

## `ckb_purpose` for Nexus

Nexus will use the purpose codes from 0x80434b43(ASCII code of "CKB")

```js
// ASCII code of CKB is 434b42(in hex)
'CKB'
  .split('')
  .map((c) => c.charCodeAt(0).toString(16))
  .join('') === '434b42';

// the purpose level must be hardened,
// so it should be larger than 0x80000000
0x80000000 + 0x434b42 === 0x80434b42;
```

To make it more readable, we will use `ckb_purpose'` to indicate `0x434b42'`

```
m / ckb_purpose' / *
```

And for the 1st purpose, we will use `ckb_purpose 1'` to indicate `0x80434b43'`(`ckb_purpose'` + 1)

```
m / ckb_purpose 1' / ...
```

## In Use Proposes

- `m / 44' / 309' / 0' / change / index`: full ownership
- `m / ckb_purpose 1' / account' / index`: rule-based ownership

[BIP-43]: https://github.com/bitcoin/bips/blob/master/bip-0043.mediawiki 'BIP-43'
