const keycloakRealm =
  'http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect'

const authConfig = {
  clientId: 'oauth2-pkce-client',
  authorizationEndpoint: `${keycloakRealm}/auth`,
  tokenEndpoint: `${keycloakRealm}/token`,
  logoutEndpoint: `${keycloakRealm}/logout`,
  redirectUri: `${window.location.origin}/`,
  logoutRedirect: `${window.location.origin}/`,
  scope: 'openid profile email offline_access',
  autoLogin: false,
  onRefreshTokenExpire: (event) => event.logIn(),
}
export default authConfig;
