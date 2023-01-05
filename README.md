# Jstris+

Script bundle for [jstris](https://jstris.jezevec10.com/), notably:

- 1v1 skill-based matchmaking
- added graphic effects
- many QOL and layout improvements

(uses [webpack-userscript](https://github.com/freund17/webpack-userscript) template)

How do I start developing?
==========================

1. Add the `devLoader.user.js` userscript.
2. Run `npm run dev` to spin up the webpack server.
3. Refresh the page and make sure the dev loader script is on.
4. Making changes to any of the files will refresh the page and the script.

How do I build my userscript/extension for distribution?
=============================================

1. Run `npm i` to ensure all packages are properly installed
2. Run `npm run pack`
3. Your userscript is in `build/bundle.user.js`
4. Unpacked versions of extensions will be in `build/jstris-plus-chrome` and `build/jstris-plus-firefox`


Troubleshooting
===============

The server doesn't notice a filechange
--------------------------------------
Most likely the maximum number of watchers is surpassed.
Try adding `fs.inotify.max_user_watches=524288` to /etc/sysctl.conf and execute `sysctl -p`.
```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

