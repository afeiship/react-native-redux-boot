var React = require('react');
var AppRegistry = require('react-native').AppRegistry;
var nx = require('next-js-core2');
var createStore = require('redux').createStore;
var bindActionCreators = require('redux').bindActionCreators;

var States = require('../redux-base/redux-states');
var Actions = require('../redux-base/redux-actions');
var Reducers = require('../redux-base/redux-reducers');
var COMMAND = require('./const').COMMAND;
var ERROR_MSG = 'App initialState must be set!';

var ReduxBoot = nx.declare({
  statics: {
    run: function (inApp, inAppName, inOptions) {
      return new ReduxBoot(inApp, inAppName, inOptions);
    }
  },
  properties: {
    root: {
      set: function (inValue) {
        this._$actions.root(inValue);
      },
      get: function () {
        return States.getRoot(this._store);
      }
    },
    error: {
      set: function (inValue) {
        this._$actions.error(inValue);
      },
      get: function () {
        return States.getError(this._store);
      }
    },
    memory: {
      set: function (inValue) {
        this._$actions.memory(inValue);
      },
      get: function () {
        return States.getMemory(this._store);
      }
    },
    request: {
      set: function (inValue) {
        this._$actions.request(inValue);
      },
      get: function () {
        return States.getRequest(this._store);
      }
    }
  },
  methods: {
    init: function (inApp, inAppName, inOptions) {
      //if (inApp.initialState && inApp.appKey)
      if (inApp.initialState) {
        this._app = inApp;
        this._appName = inAppName;
        this._options = inOptions;
        this._rootTag = 0;
        this._store = createStore(this.reducers.bind(this));
        this._$actions = bindActionCreators(Actions, this._store.dispatch);
        this.subscribe();
        this.renderTo();
      } else {
        alert(ERROR_MSG);
        nx.error(ERROR_MSG);
      }
    },
    reducers: function (inState, inAction) {
      var initialState = this._app.initialState();
      return Reducers(inState || initialState, inAction);
    },
    subscribe: function () {
      this._store.subscribe(this.renderTo.bind(this));
    },
    command: function (inName, inData, inContext) {
      inContext.fire(COMMAND, {
        name: inName,
        data: inData
      }, inContext);
    },
    onCommand: function (inName, inHandler, inContext) {
      inContext.on(COMMAND, function (inSender, inArgs) {
        if (inArgs.name === inName) {
          inHandler.call(inContext, inSender, inArgs.data);
        }
      }, inContext);
    },
    renderTo: function () {
      //https://github.com/facebook/react-native/blob/master/Libraries/ReactNative/AppRegistry.js
      var self = this;
      var appKeys = AppRegistry.getAppKeys();
      var appName = this._appName;
      var initialProps = {
        store: this._store,
        update: States.getUpdate.bind(this, this._store),
        command: this.command.bind(this),
        onCommand: this.onCommand.bind(this),
        $: this
      };

      if (appKeys.length === 0) {
        AppRegistry.registerComponent(appName, function () {
          return function () {
            self._rootTag = arguments[0].rootTag;
            return React.createElement(self._app, initialProps);
          };
        });
      } else {
        AppRegistry.runApplication(appName, {
          initialProps: initialProps,
          rootTag: this._rootTag
        });
      }
    }
  }
});

module.exports = ReduxBoot;
