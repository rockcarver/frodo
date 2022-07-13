[lib-frodo](../README.md) / [Modules](../modules.md) / [admin](../modules/admin.md) / [<internal\>](../modules/admin._internal_.md) / GlobalState

# Interface: GlobalState

[admin](../modules/admin.md).[<internal>](../modules/admin._internal_.md).GlobalState

Descibes the global state of a lib-frodo client

## Table of contents

### Properties

- [allowInsecureConnection](admin._internal_.GlobalState.md#allowinsecureconnection)
- [amVersion](admin._internal_.GlobalState.md#amversion)
- [bearerToken](admin._internal_.GlobalState.md#bearertoken)
- [cookieName](admin._internal_.GlobalState.md#cookiename)
- [cookieValue](admin._internal_.GlobalState.md#cookievalue)
- [deploymentType](admin._internal_.GlobalState.md#deploymenttype)
- [frodoVersion](admin._internal_.GlobalState.md#frodoversion)
- [logApiKey](admin._internal_.GlobalState.md#logapikey)
- [logApiSecret](admin._internal_.GlobalState.md#logapisecret)
- [password](admin._internal_.GlobalState.md#password)
- [realm](admin._internal_.GlobalState.md#realm)
- [tenant](admin._internal_.GlobalState.md#tenant)
- [username](admin._internal_.GlobalState.md#username)

## Properties

### allowInsecureConnection

• **allowInsecureConnection**: `boolean`

`true` enable HTTP.\

#### Defined in

[src/types/state/State.d.ts:10](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L10)

___

### amVersion

• **amVersion**: ``""`` \| [`ALL_AMSupportedVersions`](../modules/admin._internal_.md#all_amsupportedversions)

which version of ForgeRock Access Management (AM) is in use.

#### Defined in

[src/types/state/State.d.ts:14](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L14)

___

### bearerToken

• **bearerToken**: `string`

The bearer Token, a predominant type of access token used with OAuth 2.0.

#### Defined in

[src/types/state/State.d.ts:18](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L18)

___

### cookieName

• **cookieName**: `string`

After auth you will have a cookie with a name and value, this is the name.

#### Defined in

[src/types/state/State.d.ts:22](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L22)

___

### cookieValue

• **cookieValue**: `string`

After auth you will have a cookie with a name and value, this is the value.

#### Defined in

[src/types/state/State.d.ts:26](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L26)

___

### deploymentType

• **deploymentType**: ``"classic"`` \| ``"cloud"`` \| ``"forgeops"``

choose the context of the target environment

#### Defined in

[src/types/state/State.d.ts:30](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L30)

___

### frodoVersion

• `Readonly` **frodoVersion**: `string`

The version of lib-frodo, this cannot be changed.

#### Defined in

[src/types/state/State.d.ts:34](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L34)

___

### logApiKey

• **logApiKey**: `string`

You provide a generated logging API key from the tenant.

#### Defined in

[src/types/state/State.d.ts:42](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L42)

___

### logApiSecret

• **logApiSecret**: `string`

You provide a generated logging API secret from the tenant.

#### Defined in

[src/types/state/State.d.ts:46](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L46)

___

### password

• **password**: `string`

The password of the admin user.

#### Defined in

[src/types/state/State.d.ts:50](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L50)

___

### realm

• **realm**: `string`

Which realm do the frodo commands affect?

#### Defined in

[src/types/state/State.d.ts:54](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L54)

___

### tenant

• **tenant**: `string`

What is the url of the tenant?

#### Defined in

[src/types/state/State.d.ts:38](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L38)

___

### username

• **username**: `string`

The username of the admin user.

#### Defined in

[src/types/state/State.d.ts:58](https://github.com/adam-cyclones/frodo/blob/a9b5a54/src/types/state/State.d.ts#L58)
