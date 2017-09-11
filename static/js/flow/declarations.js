// @flow
/* eslint-disable no-unused-vars */
declare var SETTINGS: {
  gaTrackingID: string,
  reactGaDebug: boolean,
  public_path: string,
  auth_url: string|null,
  session_url: string|null,
  FEATURES: {
    [key: string]: boolean,
  },
}

// mocha
declare var it: Function
declare var beforeEach: Function
declare var afterEach: Function
declare var describe: Function

// webpack
declare var __webpack_public_path__: string // eslint-disable-line camelcase

declare var module: {
  hot: any,
}
