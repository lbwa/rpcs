# Changelog

### [1.0.1](https://github.com/lbwa/rpcs/compare/v1.0.0...v1.0.1) (2022-08-31)

### Bug Fixes

- exposePipe generic constraints should be Record<string, any> ([85756d8](https://github.com/lbwa/rpcs/commit/85756d8da62bdc44a0d0e933d25d4e2a515d351e))

## [1.0.0](https://github.com/lbwa/rpcs/compare/v0.2.1...v1.0.0) (2022-07-04)

### Features

- create BrowserAdaptor to support browser platform ([972e206](https://github.com/lbwa/rpcs/commit/972e20602873d7fed602b15511afccab090be16b))
- createRequest as common request layer ([1ab33bc](https://github.com/lbwa/rpcs/commit/1ab33bceae907a42748a2979407301ccde2b98ce))
- rename connectPipe & exposePipe ([6274579](https://github.com/lbwa/rpcs/commit/62745792e58a1f40812b5f8eaddefc64e252c3a3))
- UnknownAdatpor as fallback ([826280d](https://github.com/lbwa/rpcs/commit/826280d2fd26b96bccf87dba0786d70afa71da60))

### Bug Fixes

- only make connectPipe & exposePipe public ([1d75749](https://github.com/lbwa/rpcs/commit/1d75749b1c9654e6e1757b2fba7a4d2d26382d10))

### [0.2.1](https://github.com/lbwa/rpcs/compare/v0.2.0...v0.2.1) (2022-03-30)

### Bug Fixes

- not only error message, but also error object when evalution failed ([f5143f0](https://github.com/lbwa/rpcs/commit/f5143f04265e0599070018d8bd07131c21f41c3d))

## [0.2.0](https://github.com/lbwa/rpcs/compare/v0.1.1...v0.2.0) (2022-03-29)

### Features

- support promise return in exposeRpc's method ([3c191c5](https://github.com/lbwa/rpcs/commit/3c191c5401dade74e01ee123b71fba4dfc5fc843)), closes [#1](https://github.com/lbwa/rpcs/issues/1)

### Bug Fixes

- endpoint judgment ([cbf3368](https://github.com/lbwa/rpcs/commit/cbf336841f3bb379adbdae5768af4c9c8c4c8a9f)), closes [#2](https://github.com/lbwa/rpcs/issues/2)

### [0.1.1](https://github.com/lbwa/rpcs/compare/v0.1.0...v0.1.1) (2022-03-27)

### Bug Fixes

- support esm product ([e3a776e](https://github.com/lbwa/rpcs/commit/e3a776e0dbec2521ddccae113f1b0adbf581348b))

## 0.1.0 (2022-03-27)

### Features

- **call:** remote method call ([ba3fc3c](https://github.com/lbwa/rpcs/commit/ba3fc3c96dcb47d836ae413ef7998f4b29028819))
- compatible with web worker and worker thread ([525049c](https://github.com/lbwa/rpcs/commit/525049c282156faf7d316f1e9f8446708dcf42ba))
- prototype ([7a7ebc9](https://github.com/lbwa/rpcs/commit/7a7ebc9377fa87b87976dd67791e61d3a94e2864))

### Bug Fixes

- typings ([bee1f29](https://github.com/lbwa/rpcs/commit/bee1f298c4042c06f4489d8281a9056ef92a9a62))
