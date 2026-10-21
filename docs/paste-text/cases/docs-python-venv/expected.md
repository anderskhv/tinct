---
title: venv — Creation of virtual environments
author: Python Software Foundation
language: en
source: https://docs.python.org/3/library/venv.html
retrieved: 2026-10-21
sections: 5
words: ~2490
---

## venv — Creation of virtual environments

Added in version 3.3.

**Source code:** [Lib/venv/](https://github.com/python/cpython/tree/3.15/Lib/venv/)

The `venv` module supports creating lightweight “virtual environments”, each with their own independent set of Python packages installed in their [`site`](https://docs.python.org/3/library/site.html#module-site) directories. A virtual environment is created on top of an existing Python installation, known as the virtual environment’s “base” Python, and by default is isolated from the packages in the base environment, so that only those explicitly installed in the virtual environment are available. See [Virtual Environments](https://docs.python.org/3/library/sys_path_init.html#sys-path-init-virtual-environments) and `site`’s [virtual environments documentation](https://docs.python.org/3/library/site.html#site-virtual-environments-configuration) for more information.

When used from within a virtual environment, common installation tools such as [pip](https://pypi.org/project/pip/) will install Python packages into a virtual environment without needing to be told to do so explicitly.

A virtual environment is (amongst other things):

- Used to contain a specific Python interpreter and software libraries and binaries which are needed to support a project (library or application). These are by default isolated from software in other virtual environments and Python interpreters and libraries installed in the operating system.
- Contained in a directory, conventionally named `.venv` or `venv` in the project directory, or under a container directory for lots of virtual environments, such as `~/.virtualenvs`.
- Not checked into source control systems such as Git.
- Considered as disposable – it should be simple to delete and recreate it from scratch. You don’t place any project code in the environment.
- Not considered as movable or copyable – you just recreate the same environment in the target location.

See [**PEP 405**](https://peps.python.org/pep-0405/) for more background on Python virtual environments.

See also

[Python Packaging User Guide: Creating and using virtual environments](https://packaging.python.org/guides/installing-using-pip-and-virtual-environments/#create-and-use-virtual-environments)

[Availability](https://docs.python.org/3/library/intro.html#availability): not Android, not iOS, not WASI.

This module is not supported on [mobile platforms](https://docs.python.org/3/library/intro.html#mobile-availability) or [WebAssembly platforms](https://docs.python.org/3/library/intro.html#wasm-availability).

## Creating virtual environments

Virtual environments are created by executing the `venv` module:

```
python -m venv /path/to/new/virtual/environment
```

This creates the target directory (including parent directories as needed) and places a `pyvenv.cfg` file in it with a `home` key pointing to the Python installation from which the command was run. It also creates a `bin` (or `Scripts` on Windows) subdirectory containing a copy or symlink of the Python executable (as appropriate for the platform or arguments used at environment creation time). It also creates a `lib/pythonX.Y/site-packages` subdirectory (on Windows, this is `Lib\site-packages`). If an existing directory is specified, it will be re-used.

Changed in version 3.5: The use of `venv` is now recommended for creating virtual environments.

…

        builder.create(d)
if __name__ == '__main__':
    rc = 1
    try:
        main()
        rc = 0
    except Exception as e:
        print('Error: %s' % e, file=sys.stderr)
    sys.exit(rc)
```

<!-- excerpt only: third-party text. Complete heading list of the expected output follows. -->

## Section headings (complete)

- `## venv — Creation of virtual environments`
- `## Creating virtual environments`
- `## How venvs work`
- `## API`
- `## An example of extending `EnvBuilder``
