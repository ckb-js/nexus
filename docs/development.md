# Development

## Debugging

When development mode is enabled(`process.env.NODE_ENV === 'development'`), the following features are enabled:

### `_nexusModuleFacotry`

A `_nexusModuleFactory` property is injected in global scope, which can be used to factory a module. This is useful for debugging the module factory.

```js
let hub = globalThis._nexusModuleFactory.get('eventHub');
hub.emit('networkChanged', 'network-id');
```
