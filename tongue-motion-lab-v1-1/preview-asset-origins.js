/* Preview transport only. The animation bundle and all asset bytes are unchanged. */
(function () {
  'use strict';
  var base = new URL('.', document.currentScript.src);
  var archive = 'https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/a6e060a30075d511d574015984d728a6a2087995/tongue-motion-lab-v1-1/';
  var files = [
    'assets/onward-ad-v1/onward-ad-v1.glb',
    'tongue-sleeve-lab/assets/user-hand-parts.glb',
    'tongue-sleeve-lab/assets/user-hand-rig.glb',
    'tongue-motion-lab/assets/tongue-cuff-morphs.f16'
  ];
  var origins = new Map(files.map(function (path) { return [new URL(path, base).href, archive + path + '?preview=1.1']; }));
  var nativeFetch = window.fetch.bind(window);
  window.fetch = function (input, options) {
    var url = input instanceof Request ? input.url : new URL(String(input), document.baseURI).href;
    var target = origins.get(url);
    if (!target) return nativeFetch(input, options);
    return nativeFetch(input instanceof Request ? new Request(target, input) : target, options);
  };
}());
