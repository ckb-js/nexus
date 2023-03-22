# Pull Request

Nexus is built and released using [auto](https://github.com/intuit/auto).
This is a tool that automates the release process and generates release notes. It is configured in the `package.json`

## Creating a Pull Request

When creating a pull request, please ensure that you have followed the guidelines below.

### Labeling Pull Request

`auto` uses labels to determine the next version number and the type of release. Please ensure that you have added the
correct labels to your pull request.

- `patch` - A patch release is a small change that does not break the API. This is the default label.
- `minor` - A minor release is a change that adds functionality in a backwards-compatible manner.
- `major` - A major release is a change that is not backwards-compatible.
- `skip-release` - This label will prevent `auto` from creating a release.
- `documentation` - This label will prevent `auto` from creating a release.

For more information on how `auto` uses labels, please see
the [documentation](https://intuit.github.io/auto/docs/configuration/autorc#labels).
