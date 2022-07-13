[lib-frodo](../README.md) / [Modules](../modules.md) / log

# Module: log

## Table of contents

### Namespaces

- [&lt;internal\&gt;](log._internal_.md)

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
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| keyof [`WithSecrets`](../interfaces/log._internal_.WithSecrets.md)\> |

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
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| keyof [`WithSecrets`](../interfaces/log._internal_.WithSecrets.md)\> |

#### Returns

`void`
