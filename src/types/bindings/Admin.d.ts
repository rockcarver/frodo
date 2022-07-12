import { WithOptions } from '../state/State';
import { WithRealm } from '../unions/WithRealm';
import { WithTenant } from '../unions/WithTenant';
import { WithUsername, WithPassword } from '../unions/WithCredentials';
// create-oauth2-client-with-admin-privileges [options] <tenant> [realm] [user] [password]  Create an oauth2 client with admin
//                                                                                          privileges.
//   get-access-token [options] <tenant> [realm] [user] [password]                            Get an access token using client credentials
//                                                                                          grant type.
//   list-oauth2-clients-with-admin-privileges [options] <tenant> [realm] [user] [password]   List oauth2 clients with admin privileges.
//   grant-oauth2-client-admin-privileges [options] <tenant> [realm] [user] [password]        Grant an oauth2 client admin privileges.
//   revoke-oauth2-client-admin-privileges [options] <tenant> [realm] [user] [password]       Revoke admin privileges from an oauth2
//                                                                                          client.
//   list-oauth2-clients-with-custom-privileges [options] <tenant> [realm] [user] [password]  List oauth2 clients with custom privileges.
//   list-static-user-mappings [options] <tenant> [realm] [user] [password]                   List all subjects of static user mappings
//                                                                                          that are not oauth2 clients.
//   remove-static-user-mapping [options] <tenant> [realm] [user] [password]                  Remove a subject's static user mapping.
//   add-autoid-static-user-mapping [options] <tenant> [realm] [user] [password]              Add AutoId static user mapping to enable
//                                                                                          dashboards and other AutoId-based
//                                                                                          functionality.
//   hide-generic-extension-attributes [options] <tenant> [realm] [user] [password]           Hide generic extension attributes.
//   show-generic-extension-attributes [options] <tenant> [realm] [user] [password]           Show generic extension attributes.
//   repair-org-model [options] <tenant> [realm] [user] [password]                            Repair org model.

export type CreatePrivlidgedOAuth2Client = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

export type ListPrivlidgedOAuth2Clients = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

export type GrantPrivlidgedOAuth2Client = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;

export type RevokePrivlidgedOAuth2Client = (
  options: WithOptions<
    keyof WithTenant | keyof WithRealm | keyof WithUsername | keyof WithPassword
  >
) => void;
