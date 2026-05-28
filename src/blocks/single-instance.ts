// Coordinator customJS — drives two tile states for designated custom tools:
//   • TODO triangle (.shaman-tool-todo)  — shown when `required: true` and the
//     block has NOT yet been added to the design. Reminds the author.
//   • Locked once added (.shaman-tool-added) — applied to every tracked tile
//     once present, so it can't be added a second time. Editing still works.
//
// The tracked list is now driven by policy: only enabled compliance blocks are
// passed in, each with its `required` flag. Design state lives on the host
// (React) side and is posted to the editor iframe.

export interface SingleInstanceEntry {
  name: string;
  label: string;
  required: boolean;
}

export function buildSingleInstanceCustomJS(tracked: SingleInstanceEntry[]): string {
  const VERSION = Date.now();

  const SCRIPT =
    '(function(){\n' +
    'console.log("[single_instance] loaded v=' + VERSION + '");\n' +
    'var TRACKED = ' + JSON.stringify(tracked) + ';\n' +
    'var added = {};\n' +
    'function updateTiles(){\n' +
    '  var tiles = document.querySelectorAll(\'[data-tool-type="custom"]\');\n' +
    '  tiles.forEach(function(tile){\n' +
    '    var label = (tile.textContent||"").trim();\n' +
    '    TRACKED.forEach(function(t){\n' +
    '      if(t.label !== label) return;\n' +
    '      if(added[t.name]){\n' +
    '        tile.classList.add("shaman-tool-added");\n' +
    '        tile.classList.remove("shaman-tool-todo");\n' +
    '      } else {\n' +
    '        tile.classList.remove("shaman-tool-added");\n' +
    '        if(t.required) tile.classList.add("shaman-tool-todo");\n' +
    '        else tile.classList.remove("shaman-tool-todo");\n' +
    '      }\n' +
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
    'updateTiles();\n' +
    '})();';

  return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(SCRIPT) + '#v=' + VERSION;
}
