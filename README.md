# Frodo - ForgeROck DO

Welcome to the Frodo project. Frodo is a JavaScript library and an accompanying command line interface (CLI) to manage PingOne Advanced Identity Cloud environments and ForgeRock platform deployments, both ForgeOps and classic deployments.

<table width="100%" style="border-collapse: collapse;">
  <tr>
  	<th width="15%"></th>
  	<th width="42%" halign="left"><a href="https://github.com/rockcarver/frodo-cli">Frodo CLI</a></th>
  	<th width="43%" halign="left"><a href="https://github.com/rockcarver/frodo-lib">Frodo Library</a></th>
  </tr>
  <tr valign="top">
    <td></td>
  	<td>A command line interface to manage ForgeRock platform deployments supporting PingOne Advanced Identity Cloud environments, ForgeOps deployments, and classic deployments. Frodo-cli is powered by frodo-lib, a hybrid (ESM and CJS) library to manage ForgeRock deployments.<br><br>
    <i>Frodo CLI is the right tool for you if you want to manage ForgeRock deployments from the command line: Export and import your trees/journeys, scripts, and other configuration but you are not planning on writing your own code except for maybe automating the process using shell scripting or CI/CD tooling.</i></td>
  	<td>JavaScript Library to manage ForgeRock Identity Cloud tenants, ForgeOps deployments, and classic deployments.<br>
    Frodo Library powers Frodo CLI, the command line tool to manage ForgeRock deployments.<br><br>
    <i>Frodo Library is the right tool for you if you want to write your own tooling to automate ForgeRock platform deployments.</i></td>
  </tr>
  <tr valign="top">
    <td>Repo & Doc</td>
  	<td><a href="https://github.com/rockcarver/frodo-cli">frodo-cli</a></td>
  	<td><a href="https://github.com/rockcarver/frodo-lib">frodo-lib</a></td>
  </tr>
  <tr valign="top">
    <td>Releases</td>
  	<td>
      Latest Architecture (v2.0.0 and newer)
      <ul>
        <li><a href="https://www.npmjs.com/package/@rockcarver/frodo-cli">NPM</a></li>
        <li><a href="https://github.com/rockcarver/frodo-cli/releases">GitHub (source and binaries)</a></li>
      </ul>
      Legacy Architecture (v1.0.1 and older)
      <ul>
        <li><a href="https://github.com/rockcarver/frodo/releases">GitHub (source and binaries)</a></li>
      </ul>
    </td>
  	<td>
      Latest Architecture (v2.0.0 and newer)
      <ul>
        <li><a href="https://www.npmjs.com/package/@rockcarver/frodo-lib">NPM</a></li>
        <li><a href="https://github.com/rockcarver/frodo-lib/releases">GitHub (source)</a></li>
      </ul>
    </td>
  </tr>
  <tr valign="top">
    <td>Install</td>
  	<td>If you want to use the CLI but do not intend to develop or contribute to frodo, please refer to the <a href="https://github.com/vscheuber/frodo-cli#quick-start">Quick Start</a> guide to get up and running in minutes.</td>
  	<td>If you are a node developer and want to use `frodo-lib` as a library for your own applications, follow <a href="https://github.com/rockcarver/frodo-lib#npm-package">these instructions</a>.</td>
  </tr>
  <tr valign="top">
    <td>Issues</td>
  	<td><a href="https://github.com/rockcarver/frodo-cli/issues">Request cli features and report issues</a></td>
  	<td><a href="https://github.com/rockcarver/frodo-lib/issues">Request library features and report issues</a></td>
  </tr>
  <tr valign="top">
    <td>Highlights</td>
  	<td colspan="2">
      Frodo allows an administrator to easily connect to and manage any number of Identity Cloud tenants, ForgeOps deployment instances, or classic deployment instances from the command line. The following tasks are currently supported:

- `User mode`
  Install and run pre-compiled single-file binaries - without any dependencies - for MacOS, Windows, and Linux.

- `Manage journeys/trees`
  Export, import and pruning of journeys. Frodo handles referenced scripts and email templates.

- `Manage applications`
  List, export, and import applications (OAuth2 clients).

- `Manage connection profiles`
  Saving and reading credentials (for multiple ForgeRock deployments) from a configuration file.

- `Manage email templates`
  List, export, and import email templates.

- `Manage IDM configuration`
  Export of IDM configuration. Import is coming.

- `Print versions and tokens`
  Obtain ForgeRock session token and admin access_tokens for a ForgeRock Identity Cloud or platform (ForgeOps) deployment

- `View Identity Cloud logs`
  List available log sources and tail them.

- `Manage realms`
  List realms and show realm details. Allow adding and removing of custom DNS names.

- `Manage scripts`
  List, export, and import scripts.

- `Manage Identity Cloud environment specific variables and secrets`
  List and view details of secrets and variables in Identity Cloud.

- `Platform admin tasks`
  Common tasks administrators need to perform daily that are tedious and repetitive. Advanced tasks, which used to be involved and potentially dangerous if performed manually, now made easy and safe.
  - Create an oauth2 client with admin privileges.
  - Get an access token using client credentials grant type.
  - List oauth2 clients with admin privileges.
  - Grant an oauth2 client admin privileges.
  - Revoke admin privileges from an oauth2 client.
  - List oauth2 clients with custom privileges.
  - List all subjects of static user mappings that are not oauth2 clients.
  - Remove a subject's static user mapping.
  - Add AutoId static user mapping to enable dashboards and other AutoId-based functionality.
  - Hide generic extension attributes.
  - Show generic extension attributes.
  - Repair org model (beta).

- `Developer mode`
  Install and run in developer mode (npm i -g)
    </td>
  </tr>
  <tr valign="top">
    <td>Contributing</td>
  	<td><a href="https://github.com/rockcarver/frodo-cli/blob/main/docs/CONTRIBUTE.md">Help us improve the Frodo CLI</a></td>
  	<td><a href="https://github.com/rockcarver/frodo-lib/blob/main/docs/CONTRIBUTE.md">Join the effort to create the best library for ForgeRock platform management</a></td>
  </tr>
  <tr valign="top">
    <td>Maintaining</td>
  	<td><a href="https://github.com/rockcarver/frodo-cli/blob/main/docs/PIPELINE.md">Info for Frodo CLI maintainers</a></td>
  	<td><a href="https://github.com/rockcarver/frodo-lib/blob/main/docs/PIPELINE.md">Info for Frodo Library maintainers</a></td>
  </tr>
</table>
