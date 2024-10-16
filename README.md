# Yoga

Yet another leap.nvim for vscode. (*Yoga* is not a recursive acronym. 🤣)

![logo](https://raw.githubusercontent.com/mrcroxx/vscode-yoga/main/assets/logo.png)

A general-purpose motion plugin for vscode. Search and jump to anywhere!

## Usage

1. Open finder with `ctrl + alt + s` / `control + option + s`.
2. Enter the characters following the position you want to jump to.
3. Confirm the label to jump!

![demo](https://raw.githubusercontent.com/mrcroxx/vscode-yoga/main/assets/screenshot/demo.gif)

## Features

- Search with a string with any length.
- Jump between tabs.
- Enable/disable case sensitive search.

## Default Shortcuts

- `ctrl + alt + s` / `control + option + s`: Yoga Find.
- `ctrl + alt + shift + s` / `control + option + shift + s`: Yoga Find (Case Sensitive).
- `ctrl + alt + d` / `control + option + d`: Yoga Find End.
- `ctrl + alt + shift + d` / `control + option + shift + d`: Yoga Find End (Case Sensitive).

## Extension Settings

| properties | comment | type | default |
| - | - | - | - |
| `yoga.activeEditorOnly` | Only find matches in the active text editor. | `boolean` | `false` |
| `yoga.alphabet` | Alphabet for label generation. | `string` | `"abcdefghijklmnopqrstuvwxyz"` |

## Release Notes

### 0.0.4

- Sanity-Healthy decoration.

### 0.0.3

- Support find end.

### 0.0.2

- Support customized alphabet.

### 0.0.1

- Search and jump.
- Enable/disable case sensitive search.
- Enable/disable search between tabs.