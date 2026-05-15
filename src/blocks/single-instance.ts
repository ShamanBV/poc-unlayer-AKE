// Coordinator customJS — enforces single-instance for designated custom tools.
//
// For each tracked tool (preview_disclosures, regulatory_footer, legal_footer):
//   • Before added: tile shows a "TODO" badge to remind the user.
//   • Once added:   tile is dimmed and drag/click is blocked, so it can't be
//                   added a second time. Editing the placed block still works.
//
// Design state lives on the host side (React). The host scans every change
// and posts {type:'shaman:tool-state', added:{...}} to the editor iframe.
// This script receives those messages and toggles tile classes accordingly.

const TRACKED = [
  { name: 'preview_disclosures', label: 'Preview disclosures' },
  { name: 'regulatory_footer', label: 'Regulatory footer' },
  { name: 'legal_footer', label: 'Legal footer' },
];

const VERSION = Date.now();

const SCRIPT =
  '(function(){\n' +
  'console.log("[single_instance] loaded v=' + VERSION + '");\n' +
  'var TRACKED = ' + JSON.stringify(TRACKED) + ';\n' +
  'var added = {};\n' +
  'function updateTiles(){\n' +
  '  var tiles = document.querySelectorAll(\'[data-tool-type="custom"]\');\n' +
  '  tiles.forEach(function(tile){\n' +
  '    var label = (tile.textContent||"").trim();\n' +
  '    TRACKED.forEach(function(t){\n' +
  '      if(t.label !== label) return;\n' +
  '      if(added[t.name]){tile.classList.add("shaman-tool-added");tile.classList.remove("shaman-tool-todo");}\n' +
  '      else{tile.classList.remove("shaman-tool-added");tile.classList.add("shaman-tool-todo");}\n' +
  '    });\n' +
  '  });\n' +
  '}\n' +
  'window.addEventListener("message",function(e){\n' +
  '  if(e.data&&e.data.type==="shaman:tool-state"){added=e.data.added||{};updateTiles();}\n' +
  '});\n' +
  '// Block drag/click on tiles already present in the design.\n' +
  'function isLocked(target){\n' +
  '  return !!(target&&target.closest&&target.closest(\'.blockbuilder-content-tool[data-tool-type="custom"].shaman-tool-added\'));\n' +
  '}\n' +
  '["pointerdown","mousedown","click"].forEach(function(ev){\n' +
  '  document.addEventListener(ev,function(e){if(isLocked(e.target)){e.stopImmediatePropagation();e.preventDefault();}},true);\n' +
  '});\n' +
  '// Tiles are re-created when the Content tab opens — keep classes in sync.\n' +
  'new MutationObserver(function(){updateTiles();}).observe(document.body,{childList:true,subtree:true});\n' +
  '// Apply initial TODO state until host posts the real state.\n' +
  'updateTiles();\n' +
  '})();';

export const SINGLE_INSTANCE_CUSTOM_JS =
  'data:text/javascript;charset=utf-8,' + encodeURIComponent(SCRIPT) + '#v=' + VERSION;
