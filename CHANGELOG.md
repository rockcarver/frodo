# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.3-alpha.28] - 2022-07-07

## [0.6.3-alpha.27] - 2022-07-07

### Added

-   This CHANGELOG.md file

### Changed

-   Adapted true semantic versioning
-   Pipeline changes to automate release notes

## [0.6.3-alpha.1 - 25] [YANKED]

## [0.6.2] [YANKED]

## [0.6.1 alpha 26] - 2022-06-28

### Changed

-   Changed archive step of Windows binary build to use 7zip

## [0.6.1 alpha 25][YANKED]

## [0.6.1 alpha 24][YANKED]

## [0.6.1 alpha 23][YANKED]

## [0.6.1 alpha 22][YANKED]

## [0.6.1 alpha 21] - 2022-06-27

### Added

-   Added theme delete command
-   Theme list e2e tests
-   Theme delete e2e tests
-   Added esv command
    -   esv secret - Manage secrets.
    -   esv variable - Manage variables.
    -   esv apply - Apply pending changes.
-   Updated all dependencies to the latest versions

### Changed

-   Moved secret command under new esv command

## [0.6.1 alpha 20] - 2022-06-23

### Added

-   Added journey delete command
-   journey list e2e tests
-   journey delete e2e tests

### Changed

-   Allow progressbar output to be captured in redirects

### Fixed

-   Journey import fixes
-   Journey export bug fix
-   Fix theme import issues when using /alpha or /bravo instead of alpha or bravo
-   Fix admin create-oauth2-client-with-admin-privileges command

## [0.6.1 alpha 19] - 2022-06-14

### Added

-   First stab at e2e testing of journey command
-   saml command enhancements

### Fixed

-   Detect and remove invalid tree attributes on import
-   Fixed issue where overriding deployment type would fail to detect the default realm
-   Fix theme import -A

## [0.6.1 alpha 18] - 2022-06-10

### Added

-   \--txid parameter with the logs commands to filter log output by transactionId

### Fixed

-   Bug in idm exportAllRaw

## [0.6.1 alpha 17] - 2022-06-08

### Added

-   New saml command to manage entity providers and circles of trust

### Changed

-   Updates to journey export/import commands
    -   Support for social identity providers
    -   Support for themes
    -   Support for SAML entity providers
    -   Support for SAML circles of trust
    -   Breaking changes in journey sub-commands
        -   export
            -   \-t/--tree renamed to -i/--journey-id
        -   import
            -   \-t/--tree renamed to -i/--journey-id
            -   \-i/--journey-id is now only used to select the journey to import if there are multiple journeys in the import file
            -   \-n (No re-UUID) removed
            -   new flag --re-uuid with inversed behavior of removed -n flag. Frodo by default no longer generates new UUIDs for nodes on import
-   Scalability enhancements to journey prune command. The changes allow the prune command to scale to many thousands of orphaned node configuration objects in an AM instance
-   Updated readme
-   Miscellaneous bug fixes

## [0.6.1 alpha 16][YANKED]

## [0.6.1 alpha 15][YANKED]

## [0.6.1 alpha 14][YANKED]

## [0.6.1 alpha 13] - 2022-05-20

### Added

-   New script command to export and import scripts
-   New email_templates command to manage email templates
-   New application command to export and import oauth2 clients
-   New realm command to manage realms
-   New secret command to manage Identity Cloud secrets
-   New theme command to manage hosted pages UI themes
-   New admin command to perform advanced administrative tasks
-   Encrypt the password value in the connection profile
-   Added progress bars/spinners for long running operations
-   Added version option -v, --version
-   Auto provisioning of log API keys
-   Added initial unit testing

### Changed

-   Improved performance of journey command (multi-threading)
-   Consolidated settings under one folder (~/.frodo)
-   Proposed new code formatting (prettier) and style (eslint) rules
-   Updated readme
-   Update to node 18

### Fixed

-   Fixed problem with adding connection profiles
-   Miscellaneous bug fixes

[Unreleased]: https://github.com/vscheuber/frodo/compare/v0.6.3-alpha.28...HEAD

[0.6.3-alpha.28]: https://github.com/vscheuber/frodo/compare/v0.6.3-alpha.27...v0.6.3-alpha.28

[0.6.3-alpha.27]: https://github.com/vscheuber/frodo/compare/2098220af92e2be7603b97cbb22b85aea94ee5d2...v0.6.3-alpha.27
