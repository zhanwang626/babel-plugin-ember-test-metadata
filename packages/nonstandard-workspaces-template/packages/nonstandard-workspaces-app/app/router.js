import EmberRouter from '@ember/routing/router';
import config from '@babel-plugin-ember-test-metadata/nonstandard-workspaces-app/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () { });
