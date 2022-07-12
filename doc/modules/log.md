[lib-frodo](../README.md) / [Modules](../modules.md) / \_log

# Module: \_log

## Table of contents

### Namespaces

- [&lt;internal\&gt;](log._internal_.md)

### Functions

- [\_list](log.md#_list)
- [\_tail](log.md#_tail)

## Functions

### \_list

▸ **_list**(`config`): `Object`

A binding to get a list of log sources

**`Example`**

``` js
_list({
 host: 'https://openam-fr-example.forgeblocks.com/am',
 key: 'some-key',
 secret: '12aw33jgvvjg'
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`WithTenant`](../interfaces/log._internal_.WithTenant.md) & [`WithSecrets`](../interfaces/log._internal_.WithSecrets.md) | object |

#### Returns

`Object`

___

### \_tail

▸ **_tail**(`config`): `Object`

A binding to tail the identity cloud logs

**`Example`**

``` js
_tail({
 host: 'https://openam-fr-example.forgeblocks.com/am',
 key: 'some-key',
 secret: '12aw33jgvvjg'
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`WithTenant`](../interfaces/log._internal_.WithTenant.md) & [`WithSecrets`](../interfaces/log._internal_.WithSecrets.md) | object |

#### Returns

`Object`
