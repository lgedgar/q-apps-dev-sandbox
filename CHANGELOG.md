# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 0.1.5 - 2024-01-25

### Fixed

- Fix bug when viewing video details with no cover image.

## 0.1.4 - 2024-01-25

### Added

- Proper "view Q-Tube video" dialog, to display basic details.
- New "edit video" dialog for existing Q-Tube metadata, w/ frame extraction.
- New components:
  - QtubeVideoThumbnail
  - QtubeImagePicker
  - FrameExtractor
- Add `OPEN_NEW_TAB` action for qortalRequest sandbox page.

### Changed

- Refactored "publish to Q-Tube" dialog to leverage "edit video" logic.

## 0.1.3 - 2024-01-23

### Added

- New "Q-Tube" panel in the QDN view, to support basic "re-publish video" scenario.
- Add way to show app changelog, in about page.

### Changed

- Move logic for several things into qordial components etc.

## 0.1.2 - 2024-01-22

### Changed

- Add base64 encoding, check for existing resource when publishing.

## 0.1.1 - 2024-01-21

### Changed

- Use auth store from qordial, for user address/name.
- Use qordial plugin to authenticate; add first app settings.

## 0.1.0 - 2024-01-21

### Added

- First release with actual version tag.
