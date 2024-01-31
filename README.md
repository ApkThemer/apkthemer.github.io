# Introduction
A (or at least intended to be) simple, easy-to-use web page for modifying the colours of an apk.

Some screenshots:

## Dark Mode

<img align="center" src="https://github.com/ApkThemer/apkthemer.github.io/blob/master/screenshots/dark.jpg" />

## Light Mode

<img align="center" src="https://github.com/ApkThemer/apkthemer.github.io/blob/master/screenshots/light.jpg" />

# What It Does

Edit the colours in resources.arsc by searching for the bytes 0x1c/0x1d/0x1e/0x1f after a sequence of 0x08, 0x00, 0x00. The colours are then displayed in the webpage for the user to edit. The user will be shown a download button once they have made an edit.

# Planned Features

Some features may be added in the future:

- [ ] - Modifying drawables
- [ ] - Allow uploading of image from the app, to filter for those colours/or bring them to the top of the list
- [ ] - User supplied key for signing and/or allowing user to generate one through this site and keep for re-use

# Libraries Used
- [FileSaver](https://github.com/eligrey/FileSaver.js)
- [Coloris](https://github.com/mdbassit/Coloris)
- [android-package-sign-js](https://github.com/chromeos/android-package-sign-js)
