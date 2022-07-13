[lib-frodo](../README.md) / [Modules](../modules.md) / email-template

# Module: email-template

## Table of contents

### Functions

- [$export](email_template.md#$export)
- [$import](email_template.md#$import)
- [$list](email_template.md#$list)

## Functions

### $export

▸ **$export**(`options`): `void`

Export email templates.

**`Example`**

``` js
_export({
 state: {
     tenant: 'palantir-logger',
     user: 'example.forgeblock.com',
     password: ''
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`

___

### $import

▸ **$import**(`options`): `void`

Import email template.

**`Example`**

``` js
_import({
 state: {
     tenant: 'palantir-logger',
     user: 'example.forgeblock.com',
     password: ''
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`

___

### $list

▸ **$list**(`options`): `void`

List all the email templates in the system.

**`Example`**

``` js
_list({
 state: {
     tenant: 'palantir-logger',
     user: 'example.forgeblock.com',
     password: ''
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`
