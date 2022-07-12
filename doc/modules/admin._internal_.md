[lib-frodo](../README.md) / [Modules](../modules.md) / [\_admin](admin.md) / <internal\>

# Namespace: <internal\>

[_admin](admin.md).<internal>

## Table of contents

### Interfaces

- [GlobalState](../interfaces/admin._internal_.GlobalState.md)
- [WithOptions](../interfaces/admin._internal_.WithOptions.md)

### Type Aliases

- [ALL\_AMSupportedVersions](admin._internal_.md#all_amsupportedversions)
- [Pick](admin._internal_.md#pick)

## Type Aliases

### ALL\_AMSupportedVersions

Ƭ **ALL\_AMSupportedVersions**: ``"6.0.0.7"`` \| ``"6.0.0.6"`` \| ``"6.0.0.5"`` \| ``"6.0.0.4"`` \| ``"6.0.0.3"`` \| ``"6.0.0.2"`` \| ``"6.0.0.1"`` \| ``"6.0.0"`` \| ``"6.5.3"`` \| ``"6.5.2.3"`` \| ``"6.5.2.2"`` \| ``"6.5.2.1"`` \| ``"6.5.2"`` \| ``"6.5.1"`` \| ``"6.5.0.2"`` \| ``"6.5.0.1"`` \| ``"7.0.0"`` \| ``"7.0.1"`` \| ``"7.0.2"`` \| ``"7.1.0"`` \| ``"7.2.0"``

All AM supported versions

#### Defined in

[src/types/journey/OOTBNodeTypes.d.ts:35](https://github.com/adam-cyclones/frodo/blob/aac9f12/src/types/journey/OOTBNodeTypes.d.ts#L35)

___

### Pick

Ƭ **Pick**<`T`, `K`\>: { [P in K]: T[P] }

From T, pick a set of properties whose keys are in the union K

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `K` | extends keyof `T` |

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1558
