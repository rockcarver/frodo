[lib-frodo](../README.md) / [Modules](../modules.md) / realm

# Module: realm

## Table of contents

### Functions

- [$addCustomDomain](realm.md#$addcustomdomain)
- [$info](realm.md#$info)
- [$list](realm.md#$list)
- [$removeCustomDomain](realm.md#$removecustomdomain)

## Functions

### $addCustomDomain

▸ **$addCustomDomain**(`options`): `void`

Add custom DNS domain to a realm.

**`Example`**

``` js
$addCustomDomain({
 state: {
     tenant: 'https://palantir-example.com/am',
     realm: '/mordor',
     user: 'gandalf',
     password: 'TheAge3021!&^'
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `WithOptions`<`string` \| `number` \| `symbol`\> |

#### Returns

`void`

___

### $info

▸ **$info**(`options`): `void`

Get information about a realm.

**`Example`**

``` js
$info({
 state: {
     tenant: 'https://palantir-example.com/am',
     realm: '/mordor',
     user: 'gandalf',
     password: 'TheAge3021!&^'
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `WithOptions`<`string` \| `number` \| `symbol`\> |

#### Returns

`void`

___

### $list

▸ **$list**(`options`): `void`

List all realms.

**`Example`**

``` js
$list({
 state: {
     tenant: 'https://palantir-example.com/am',
     realm: '/mordor',
     user: 'gandalf',
     password: 'TheAge3021!&^'
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `WithOptions`<`string` \| `number` \| `symbol`\> |

#### Returns

`void`

___

### $removeCustomDomain

▸ **$removeCustomDomain**(`options`): `void`

Remove custom DNS domain to a realm.

**`Example`**

``` js
$removeCustomDomain({
 state: {
     tenant: 'https://palantir-example.com/am',
     realm: '/mordor',
     user: 'gandalf',
     password: 'TheAge3021!&^'
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `WithOptions`<`string` \| `number` \| `symbol`\> |

#### Returns

`void`
