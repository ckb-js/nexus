# Pull Request

Nexus is built and released using [auto](https://github.com/intuit/auto).
This is a tool that automates the release process and generates release notes. It is configured in the `package.json`

## Creating a Pull Request

When creating a pull request, please ensure that you have followed the guidelines below.

### Labeling Pull Request

`auto` uses labels to determine the next version number and the type of release. Please ensure that you have added the
correct labels to your pull request.

> NOTE: before graduating from the magic `0.x.x` version, `auto` will treat `major` as `minor` and `minor` as `patch`.

| Label           | Description                                | Release Type |
| --------------- | ------------------------------------------ | ------------ |
| `major`         | Increment the major version when merged    | `major`      |
| `minor`         | Increment the minor version when merged    | `minor`      |
| `patch`         | Increment the patch version when merged    | `patch`      |
| `skip-release`  | Preserve the current version when merged   | `skip`       |
| `release`       | Create a release when this pr is merged    | `release`    |
| `internal`      | Changes only affect the internal API       | `none`       |
| `documentation` | Changes only affect the documentation      | `none`       |
| `tests`         | Add or improve existing tests              | `none`       |
| `dependencies`  | Update one or more dependencies version    | `none`       |
| `performance`   | Improve performance of an existing feature | `patch`      |

For more information on how `auto` uses labels, please see
the [documentation](https://intuit.github.io/auto/docs/configuration/autorc#labels).
