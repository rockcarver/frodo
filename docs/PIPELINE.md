# Frodo Release Pipeline

The Frodo project uses a fully automated release [pipeline](../.github/workflows/pipeline.yml) based on GitHub workflows:

![Frodo Release Pipeline Workflow](images/release_pipeline.png)

## Releasing Frodo

This information is only actionable if you are an active contributor or maintainer with appropriate access to the repository and need to understand how frodo releases work.

### Every Push Triggers A Release

Frodo adopted the principle of continuous integration. Therefore every push to the main branch in the [rockcarver/frodo] repository trigger the automated release pipeline.

The pipeline determines the type of release - `prerelease`, `patch`, `minor`, `major` - for the push:

- Scans the commit and PR comments for trigger phrases:
  - `PATCH RELEASE` triggers a `patch` release
  - `MINOR RELEASE` triggers a `minor` release
  - `MAJOR RELEASE` triggers a `major` release
  - Everything else triggers a `prerelease`
- Bumps the version accordingly:<br>
  `<major>`.`<minor>`.`<patch>`-`<prerelease>`
- Updates the [changelog](../CHANGELOG.md) file in [keep a changelog](https://keepachangelog.com/en/1.0.0/) format:
  - Creates a new release heading using the bumped version and a date stamp
  - Moves the content of the `Unreleased` section into the new section
  - Adds release details links

❗❗❗ IMPORTANT ❗❗❗<br>
Contributors are instructed to submit pull requests. Maintainers must make sure none of the commit comments nor the PR comment contain trigger phrases that would cause the pipeline to perform an undesired version bump and release.

### Automatic Pre-Releases During Iterative Development

The default release type (if no specific and exact trigger phrases are used) results in a pre-release. Pre-releases are flagged with the label `Pre-release` on the [release page](../releases) indicating to users that these releases are not considered final or complete.

Pre-releases are a great way to get the latest and greatest functionality but they are not fully polished, readme and changelog might not be updated and test coverage might not be complete.

### Triggering Patch, Minor, and Major Releases

Maintainers must validate PRs contain an updated `Unreleased` section in the[changelog](../CHANGELOG.md) before merging any PR. Changelog entries must adhere to the [keep a changelog](https://keepachangelog.com/en/1.0.0/) format.

Maintainers must use an appropriate trigger phrase (see: [Every Push Triggers A Release](#Every-Push-Triggers-A-Release)) in the PR title to trigger the appropriate automated version bump and release.

❗❗❗ IMPORTANT ❗❗❗<br>
Maintainers must adhere to the [guidelines set forth by the npm project](https://docs.npmjs.com/about-semantic-versioning#incrementing-semantic-versions-in-published-packages) to determine the appropriate release type:

![NPM Versioning Guidelines](images/npm_versioning_guidelines.png)

Frodo is currently in a pre-1.0.0 phase. We are striving to release 1.0.0 very soon.

## Pipeline Maintenance

Pipeline maintenance is a tricky business. Pipeline testing in forks is difficult because GitHub by default imposes a different behaviour for pipeline events than in the main repository. Some pipeline steps require branch names, which means the pipeline needs to be adopted to run in the fork and branch it is being tested in.

All of the above has lead the team to make and test pipeline changes in the main repository on the real pipeline.

### Current Pipeline Explained



### Recover From A Wrong Version Bump And Release

When testing the pipeline and especially when experimenting with the automated version bump logic, it is unavoidable that once in a while a version is released that really has to be removed. E.g. during the pipeline development and testing of the first full automation, a bump to version 1.0.0 was triggered unintentionally. While minor and patch version bumps can be dealt with, major version bumps should really not be taken lightly.

So to recover from that, the following needs to happen:

1.  Manually delete the `faulty release` from the [release page](../releases)
1.  Manually modify the following files in your fork:
    -   [CHANGELOG.md](../CHANGELOG.md)
        1.  Find the faulty release heading towards the top of the file
            1.  Move your changelog entries in the faulty release section back into the Unreleased section
            1.  Now remove the faulty release header
        1.  Find the link to the faulty release tag at the bottom of the file and remove it
    -   [package.json](../package.json)
        -   Fine the 1 occurance of the frodo version in package.json and reset it to the `previous version` from before the faulty version bump
    -   [package-lock.json](../package-lock.json)
        -   Find the 2 occurances of the faulty version in package-lock.json and reset them to the `previous version` from before the faulty version bump
1.  Commit your changes and create a new pull request
1.  In the frodo repository, merge the PR and provide the appropriate comment to trigger the intended version bump
1.  Remove the faulty tag from the repository:<br>
    This is important because you cannot update an existing tag and in order to eventually release the version in the future, you must delete it first. Beware the difference between version (e.g. `1.0.0`) and tag (e.g. `v1.0.0`). This step requires you to use the tag:
    -   From the command line, navigate to the directory where you cloned the frodo repository (_not your fork, the real one!_)
    -   Issue the following command:<br>
        ```
        git push --delete origin v1.0.0
        ```
1. Validate the pipeline created the desired new version and release