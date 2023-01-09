var fs = require('fs');
var zipFolder = require('zip-folder');

var package = JSON.parse(fs.readFileSync("package.json"))

// setup build folders
if (!fs.existsSync("build")) {
    fs.mkdirSync("build");
}
if (!fs.existsSync(`build/jstris-plus-chrome`)) {
    fs.mkdirSync(`build/jstris-plus-chrome`);
}
if (!fs.existsSync(`build/jstris-plus-firefox`)) {
    fs.mkdirSync(`build/jstris-plus-firefox`);
}

// userscript 
var userscriptHeader = `
// ==UserScript==
// @name         jstris+
// @namespace    http://tampermonkey.net/
// @version      ${package.version}
// @description  ${package.description}
// @author       orz and frey
// @run-at       document-idle
// @match        https://*.jstris.jezevec10.com/*
// @grant        none
// ==/UserScript==
`
userscriptHeader = userscriptHeader.replace("${version}", package.version);
userscriptHeader = userscriptHeader.replace("${description}", package.description);

var script = fs.readFileSync("bundle.js");

fs.writeFileSync(`build/bundle.user.js`, userscriptHeader + "\n\n" + script);

// chrome extension
const chromeExtensionManifest = {
    "name": "Jstris+",
    "action": {},
    "manifest_version": 3,
    "version": package.version,
    "description": package.description,
    "web_accessible_resources": [{
        "resources": [ "jstris-plus.js" ],
        "matches": [ "https://*.jstris.jezevec10.com/*" ]
    }],
    "icons": {
        "128": "icon.png"
    },
    "content_scripts": [
        {
            "matches": [
                "https://*.jstris.jezevec10.com/*"
            ],
            "all_frames": true,
            "js": ["content-script.js"]
        }
    ],
}
// https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-using-a-content-script/9517879#9517879
const chromeContentScript = `
var s = document.createElement('script');
s.src = chrome.runtime.getURL('jstris-plus.js');
(document.head || document.documentElement).appendChild(s);
`;
fs.writeFileSync(`build/jstris-plus-chrome/manifest.json`, JSON.stringify(chromeExtensionManifest));
fs.writeFileSync(`build/jstris-plus-chrome/content-script.js`, chromeContentScript);
fs.writeFileSync(`build/jstris-plus-chrome/jstris-plus.js`, script);
fs.copyFileSync(`icon.png`, `build/jstris-plus-chrome/icon.png`);
zipFolder(`build/jstris-plus-chrome`, `build/jstris-plus-chrome.zip`, function(err) {
    if(err)
        return console.log('oh no! ', err);
    
    // will be invoking upload process
});

// firefox extension
const firefoxExtensionManifest = {

    "manifest_version": 2,
    "name": "Jstris+",
    "version": package.version,
  
    "description": package.description,
  
    "web_accessible_resources": [
        "jstris-plus.js"
    ],

    "content_scripts": [
        {
            "matches": [
                "https://*.jstris.jezevec10.com/*"
            ],
            "all_frames": true,
            "js": ["content-script.js"]
        }
    ],

    "icons": {
        "128": "icon.png"
    },
  }
const firefoxContentScript = `
var s = document.createElement('script');
s.src = browser.runtime.getURL('jstris-plus.js');
(document.head || document.documentElement).appendChild(s);
`;
fs.writeFileSync(`build/jstris-plus-firefox/manifest.json`, JSON.stringify(firefoxExtensionManifest));
fs.writeFileSync(`build/jstris-plus-firefox/content-script.js`, firefoxContentScript);
fs.writeFileSync(`build/jstris-plus-firefox/jstris-plus.js`, script);
fs.copyFileSync(`icon.png`, `build/jstris-plus-firefox/icon.png`);
zipFolder(`build/jstris-plus-firefox`, `build/jstris-plus-firefox.zip`, function(err) {
    if(err)
        return console.log('oh no! ', err);
    
    // will be invoking upload process
});
// clean up
fs.rmSync("bundle.js")