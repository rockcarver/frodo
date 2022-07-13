[lib-frodo](../README.md) / [Modules](../modules.md) / log

# Module: log

## Table of contents

### Functions

- [$list](log.md#$list)
- [$tail](log.md#$tail)

## Functions

### $list

▸ **$list**(`options`): `void`

List available ID Cloud log sources.

**`Example`**

``` js
$list({
 state: {
     key: 'palantir-logger',
     secret: 'jdajdiwj9uf8f38ffsasdadkoajfiafj',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"key"`` \| ``"secret"``\> |

#### Returns

`void`

___

### $tail

▸ **$tail**(`options`): `void`

Tail Identity Cloud logs.

**`Example`**

``` js
$tail({
 state: {
     key: 'palantir-logger',
     secret: 'jdajdiwj9uf8f38ffsasdadkoajfiafj',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"key"`` \| ``"secret"``\> |

#### Returns

`void`
