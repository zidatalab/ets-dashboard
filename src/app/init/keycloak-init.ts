import { KeycloakService } from "keycloak-angular";

const realm = 'dashboardsso'
const clientId = 'ets_reporting_test'

export function initializeKeycloak(
  keycloak: KeycloakService
) {
  return () =>
    keycloak.init({
      config: {
        url: `https://auth.zi.de`,
        realm: 'dashboardsso',
        clientId: 'ets_reporting_test',
      },
      initOptions: {
        onLoad: "check-sso",
        checkLoginIframe: false,
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html'
      }
    });
}