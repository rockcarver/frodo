const _sessionStorage = {};

export default {
  session: {
    setItem: (key, value) => {
      _sessionStorage[key] = value;
    },
    getItem: (key) => _sessionStorage[key],
    removeItem: (key) => delete _sessionStorage[key],
    raw: _sessionStorage,
    setUsername: (value) => {
      _sessionStorage.username = value;
    },
    getUsername: () => _sessionStorage.username,
    setPassword: (value) => {
      _sessionStorage.password = value;
    },
    getPassword: () => _sessionStorage.password,
    setTenant: (value) => {
      _sessionStorage.tenant = value;
    },
    getTenant: () => _sessionStorage.tenant,
    setDeploymentType: (value) => {
      _sessionStorage.deploymentType = value;
    },
    getDeploymentType: () => _sessionStorage.deploymentType,
    setRealm: (value) => {
      _sessionStorage.realm = value;
    },
    getRealm: () => _sessionStorage.realm,
    setCookieName: (value) => {
      _sessionStorage.cookieName = value;
    },
    getCookieName: () => _sessionStorage.cookieName,
    setCookieValue: (value) => {
      _sessionStorage.cookieValue = value;
    },
    getCookieValue: () => _sessionStorage.cookieValue,
    setBearerToken: (value) => {
      _sessionStorage.bearerToken = value;
    },
    getBearerToken: () => _sessionStorage.bearerToken,
    setLogApiKey: (value) => {
      _sessionStorage.logApiKey = value;
    },
    getLogApiKey: () => _sessionStorage.logApiKey,
    setLogApiSecret: (value) => {
      _sessionStorage.logApiSecret = value;
    },
    getLogApiSecret: () => _sessionStorage.logApiSecret,
    setAmVersion: (value) => {
      _sessionStorage.amVersion = value;
    },
    getAmVersion: () => _sessionStorage.amVersion,
    setFrodoVersion: (value) => {
      _sessionStorage.frodoVersion = value;
    },
    getFrodoVersion: () => _sessionStorage.frodoVersion,
    setAllowInsecureConnection: (value) => {
      _sessionStorage.insecure = value;
    },
    getAllowInsecureConnection: () => _sessionStorage.insecure,
  },
};
