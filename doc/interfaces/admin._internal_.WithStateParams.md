[lib-frodo](../README.md) / [Modules](../modules.md) / [\_admin](../modules/admin.md) / [<internal\>](../modules/admin._internal_.md) / WithStateParams

# Interface: WithStateParams<keys\>

[_admin](../modules/admin.md).[<internal>](../modules/admin._internal_.md).WithStateParams

Many functions in  lib-frodo use a pure object pattern which require state to be passed as a object
### Why?
1. testability - easy to use static data
2. flexability - any data can override state
3. maintainability - args do not rely on order

**`Example`**

```js
func({ a, b, c, state: { username, password } });
```

## Type parameters

| Name |
| :------ |
| `keys` |

## Table of contents

### Properties

- [state](admin._internal_.WithStateParams.md#state)

## Properties

### state

• **state**: [`Pick`](../modules/admin._internal_.md#pick)<[`GlobalState`](admin._internal_.GlobalState.md), `keys`\>

The global state object to be injected where keys refer to the required keys from the global state object needed by the calling function

**`Example`**

```ts
// correct
const x: Pick<GlobalState, 'username' | 'password'> = { username: '', password: '' }
// incorrect
const y: Pick<GlobalState, 'username' | 'password'> = { username: '', password: '', insecure: true }
```

#### Defined in

[src/types/state/State.d.ts:81](https://github.com/adam-cyclones/frodo/blob/21cbedc/src/types/state/State.d.ts#L81)
