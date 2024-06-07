import { KeycloakService } from "keycloak-angular";

const realm = 'dashboardsso'
const clientId = 'ets_reporting_test'

export function initializeKeycloak(
  keycloak: KeycloakService
) {
  return () =>
    keycloak.init({
      config: {
        url: `https://auth.zi.de/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}`,
        realm: 'dashboardsso',
        clientId: 'ets_reporting_test',
      }
    });
}