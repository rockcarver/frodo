[lib-frodo](../README.md) / [Modules](../modules.md) / \_admin

# Module: \_admin

## Table of contents

### Namespaces

- [&lt;internal\&gt;](admin._internal_.md)

### Functions

- [\_addAutoIdStaticUserMapping](admin.md#_addautoidstaticusermapping)
- [\_createPrivlidgedOAuth2Client](admin.md#_createprivlidgedoauth2client)
- [\_grantPrivlidgedOAuth2Client](admin.md#_grantprivlidgedoauth2client)
- [\_hideGenericExtensionAttributes](admin.md#_hidegenericextensionattributes)
- [\_listCustomPrivilegedOAuth2Clients](admin.md#_listcustomprivilegedoauth2clients)
- [\_listPrivlidgedOAuth2Client](admin.md#_listprivlidgedoauth2client)
- [\_listStaticUserMappings](admin.md#_liststaticusermappings)
- [\_removeStaticUserMapping](admin.md#_removestaticusermapping)
- [\_repairOrgModel](admin.md#_repairorgmodel)
- [\_revokePrivlidgedOAuth2Client](admin.md#_revokeprivlidgedoauth2client)
- [\_showGenericExtensionAttributes](admin.md#_showgenericextensionattributes)

## Functions

### \_addAutoIdStaticUserMapping

▸ **_addAutoIdStaticUserMapping**(`options`): `void`

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

### \_createPrivlidgedOAuth2Client

▸ **_createPrivlidgedOAuth2Client**(`options`): `void`

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

### \_grantPrivlidgedOAuth2Client

▸ **_grantPrivlidgedOAuth2Client**(`options`): `void`

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

### \_hideGenericExtensionAttributes

▸ **_hideGenericExtensionAttributes**(`options`): `void`

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

### \_listCustomPrivilegedOAuth2Clients

▸ **_listCustomPrivilegedOAuth2Clients**(`options`): `void`

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

### \_listPrivlidgedOAuth2Client

▸ **_listPrivlidgedOAuth2Client**(`options`): `void`

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

### \_listStaticUserMappings

▸ **_listStaticUserMappings**(`options`): `void`

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

### \_removeStaticUserMapping

▸ **_removeStaticUserMapping**(`options`): `void`

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

### \_repairOrgModel

▸ **_repairOrgModel**(`options`): `void`

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

### \_revokePrivlidgedOAuth2Client

▸ **_revokePrivlidgedOAuth2Client**(`options`): `void`

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

### \_showGenericExtensionAttributes

▸ **_showGenericExtensionAttributes**(`options`): `void`

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
