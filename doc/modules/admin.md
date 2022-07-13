[lib-frodo](../README.md) / [Modules](../modules.md) / \_admin

# Module: \_admin

## Table of contents

### Namespaces

- [&lt;internal\&gt;](admin._internal_.md)

### Functions

- [$addAutoIdStaticUserMapping](admin.md#$addautoidstaticusermapping)
- [$createPrivlidgedOAuth2Client](admin.md#$createprivlidgedoauth2client)
- [$grantPrivlidgedOAuth2Client](admin.md#$grantprivlidgedoauth2client)
- [$hideGenericExtensionAttributes](admin.md#$hidegenericextensionattributes)
- [$listCustomPrivilegedOAuth2Clients](admin.md#$listcustomprivilegedoauth2clients)
- [$listPrivlidgedOAuth2Client](admin.md#$listprivlidgedoauth2client)
- [$listStaticUserMappings](admin.md#$liststaticusermappings)
- [$removeStaticUserMapping](admin.md#$removestaticusermapping)
- [$repairOrgModel](admin.md#$repairorgmodel)
- [$revokePrivlidgedOAuth2Client](admin.md#$revokeprivlidgedoauth2client)
- [$showGenericExtensionAttributes](admin.md#$showgenericextensionattributes)

## Functions

### $addAutoIdStaticUserMapping

▸ **$addAutoIdStaticUserMapping**(`options`): `void`

Add AutoId static user mapping to enable dashboards and other AutoId-based functionality.

**`Example`**

```js
_addAutoIdStaticUserMapping({
 state: {
     username: 'gandalf',
     password: 'maiar',
     realm: '/',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"realm"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`

___

### $createPrivlidgedOAuth2Client

▸ **$createPrivlidgedOAuth2Client**(`options`): `void`

Create an oauth2 client with admin privileges.

**`Example`**

``` js
_createPrivlidgedOAuth2Client({
 state: {
     username: 'gandalf',
     password: 'maiar',
     realm: '/',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"realm"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`

___

### $grantPrivlidgedOAuth2Client

▸ **$grantPrivlidgedOAuth2Client**(`options`): `void`

Grant an oauth2 client admin privileges.

**`Example`**

```js
_grantPrivlidgedOAuth2Client({
 state: {
     username: 'gandalf',
     password: 'maiar',
     realm: '/',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"realm"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`

___

### $hideGenericExtensionAttributes

▸ **$hideGenericExtensionAttributes**(`options`): `void`

Hide generic extension attributes.

**`Example`**

```js
_hideGenericExtensionAttributes({
 state: {
     username: 'gandalf',
     password: 'maiar',
     realm: '/',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"realm"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`

___

### $listCustomPrivilegedOAuth2Clients

▸ **$listCustomPrivilegedOAuth2Clients**(`options`): `void`

List oauth2 clients with custom privileges.

**`Example`**

```js
_listCustomPrivilegedOAuth2Clients({
 state: {
     username: 'gandalf',
     password: 'maiar',
     realm: '/',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"realm"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`

___

### $listPrivlidgedOAuth2Client

▸ **$listPrivlidgedOAuth2Client**(`options`): `void`

List oauth2 clients with admin privileges.

**`Example`**

```js
_listPrivlidgedOAuth2Client({
 state: {
     username: 'gandalf',
     password: 'maiar',
     realm: '/',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"realm"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`

___

### $listStaticUserMappings

▸ **$listStaticUserMappings**(`options`): `void`

List all subjects of static user mappings that are not oauth2 clients.

**`Example`**

```js
_listStaticUserMappings({
 state: {
     username: 'gandalf',
     password: 'maiar',
     realm: '/',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"realm"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`

___

### $removeStaticUserMapping

▸ **$removeStaticUserMapping**(`options`): `void`

Remove a subject's static user mapping.

**`Example`**

```js
_removeStaticUserMapping({
 state: {
     username: 'gandalf',
     password: 'maiar',
     realm: '/',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"realm"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`

___

### $repairOrgModel

▸ **$repairOrgModel**(`options`): `void`

Repair org model.

**`Example`**

```js
_repairOrgModel({
 state: {
     username: 'gandalf',
     password: 'maiar',
     realm: '/',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"realm"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`

___

### $revokePrivlidgedOAuth2Client

▸ **$revokePrivlidgedOAuth2Client**(`options`): `void`

Revoke admin privileges from an oauth2.

**`Example`**

```js
_revokePrivlidgedOAuth2Client({
 state: {
     username: 'gandalf',
     password: 'maiar',
     realm: '/',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"realm"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`

___

### $showGenericExtensionAttributes

▸ **$showGenericExtensionAttributes**(`options`): `void`

Show generic extension attributes.

**`Example`**

```js
_showGenericExtensionAttributes({
 state: {
     username: 'gandalf',
     password: 'maiar',
     realm: '/',
     tenant: 'example.forgeblock.com',
 },
});
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`WithOptions`](../interfaces/admin._internal_.WithOptions.md)<``"tenant"`` \| ``"realm"`` \| ``"username"`` \| ``"password"``\> |

#### Returns

`void`
