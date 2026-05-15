// Custom Unlayer tool: "References"
// Appears as a tile in the Content panel alongside the other custom blocks,
// but is NOT draggable to the canvas — clicking it sends a postMessage to the
// host (Shaman) so the host can open its own References drawer. No block is
// ever inserted into the email design.

const VERSION = Date.now();

const FOLDER_SVG =
  '<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="folder" class="svg-inline--fa fa-folder fa-3x" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M64 64C46.3 64 32 78.3 32 96l0 320c0 17.7 14.3 32 32 32l384 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-156.1 0c-17 0-33.3-6.7-45.3-18.7L210.7 73.4c-6-6-14.1-9.4-22.6-9.4L64 64zM0 96C0 60.7 28.7 32 64 32l124.1 0c17 0 33.3 6.7 45.3 18.7l35.9 35.9c6 6 14.1 9.4 22.6 9.4L448 96c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96z"/></svg>';

const SCRIPT =
  '(function(){\n' +
  'console.log("[references] customJS loaded v=' + VERSION + '");\n' +
  'unlayer.registerTool({\n' +
  '  name:"references_shortcut",\n' +
  '  label:"References",\n' +
  '  icon:' + JSON.stringify(FOLDER_SVG) + ',\n' +
  '  position:4,\n' +
  '  supportedDisplayModes:["email","web"],\n' +
  '  options:{},\n' +
  '  values:{},\n' +
  '  renderer:{\n' +
  '    Viewer:unlayer.createViewer({render:function(){return"";}}),\n' +
  '    exporters:{web:function(){return"";},email:function(){return"";}},\n' +
  '    head:{css:function(){return"";},js:function(){return"";}}\n' +
  '  }\n' +
  '});\n' +
  '// Hijack the tile: block drag, trigger drawer on click.\n' +
  'function isReferencesTile(el){\n' +
  '  var tile=el&&el.closest&&el.closest(".blockbuilder-content-tool[data-tool-type=\\"custom\\"]");\n' +
  '  if(!tile)return null;\n' +
  '  return tile.textContent&&tile.textContent.trim().indexOf("References")===0?tile:null;\n' +
  '}\n' +
  'document.addEventListener("pointerdown",function(e){\n' +
  '  if(isReferencesTile(e.target)){e.stopImmediatePropagation();e.preventDefault();}\n' +
  '},true);\n' +
  'document.addEventListener("mousedown",function(e){\n' +
  '  if(isReferencesTile(e.target)){e.stopImmediatePropagation();e.preventDefault();}\n' +
  '},true);\n' +
  'document.addEventListener("click",function(e){\n' +
  '  if(isReferencesTile(e.target)){\n' +
  '    e.stopImmediatePropagation();e.preventDefault();\n' +
  '    try{window.parent.postMessage({type:"shaman:open-references-drawer"},"*");}catch(err){console.error(err);}\n' +
  '  }\n' +
  '},true);\n' +
  '})();';

export const REFERENCES_CUSTOM_JS =
  'data:text/javascript;charset=utf-8,' + encodeURIComponent(SCRIPT) + '#v=' + VERSION;
