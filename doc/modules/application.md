[lib-frodo](../README.md) / [Modules](../modules.md) / application

# Module: application

## Table of contents

### Functions

- [$export](application.md#$export)
- [$import](application.md#$import)
- [$list](application.md#$list)

## Functions

### $export

▸ **$export**(`options`): `void`

Export applications.

**`Example`**

```js
$export({
  state: {
    tenant: 'palantir',
    realm: '/mordor',
    user: 'gandalf',
    password: 'TheAge3021!&^',
  },
});
```

#### Parameters

| Name      | Type                                                                                                                     |
| :-------- | :----------------------------------------------------------------------------------------------------------------------- |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<`"tenant"` \| `"realm"` \| `"username"` \| `"password"`\> |

#### Returns

`void`

---

### $import

▸ **$import**(`options`): `void`

Import application.

**`Example`**

```js
$import({
  state: {
    tenant: 'palantir',
    realm: '/mordor',
    user: 'gandalf',
    password: 'TheAge3021!&^',
  },
});
```

#### Parameters

| Name      | Type                                                                                                                     |
| :-------- | :----------------------------------------------------------------------------------------------------------------------- |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<`"tenant"` \| `"realm"` \| `"username"` \| `"password"`\> |

#### Returns

`void`

---

### $list

▸ **$list**(`options`): `void`

List all applications in a realm.

**`Example`**

```js
$list({
  state: {
    tenant: 'palantir',
    realm: '/mordor',
    user: 'gandalf',
    password: 'TheAge3021!&^',
  },
});
```

#### Parameters

| Name      | Type                                                                                                                     |
| :-------- | :----------------------------------------------------------------------------------------------------------------------- |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<`"tenant"` \| `"realm"` \| `"username"` \| `"password"`\> |

#### Returns

`void`
