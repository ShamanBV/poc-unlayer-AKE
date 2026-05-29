// Custom Unlayer tool: "Branded image"
//
// Replaces Unlayer's built-in Image tool. All images come from the Shaman
// Visual Library (BDS) — no local upload. Click the "Visual library" button
// to open the host-side modal; selection is delivered back via postMessage.
//
// Layout: Padded / Side-to-side. Switching to "Side-to-side" triggers a
// host-side row-padding adjustment so the image renders edge-to-edge in a
// way that's safe in every email client (no negative margins).

import type { BuildContext } from '../policy/compliance';

// Shaman's hosted placeholder. Served at 600×300 with the camera emoji + the
// "Add Image / Select image from library" prompt — same one used inside the
// Shaman email editor when no image has been picked yet.
const SHAMAN_PLACEHOLDER_URL =
  'https://placeholder.shamanqa.com/api/placeholder?type=large&emoji=%F0%9F%93%B7&header=Add+Image&body=Select+image+from+library';

const IMAGE_SVG =
  '<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="image" class="svg-inline--fa fa-image fa-3x" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M448 80c8.8 0 16 7.2 16 16l0 320c0 8.8-7.2 16-16 16L64 432c-8.8 0-16-7.2-16-16L48 96c0-8.8 7.2-16 16-16l384 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm248.3 196.8c-3-4.3-7.9-6.8-13.1-6.8s-10.1 2.5-13.1 6.8l-56.8 81.1-18.5-21.1c-3-3.4-7.4-5.4-12-5.4s-9 2-12 5.4l-71.7 81.8c-4.1 4.6-5 11.2-2.4 16.8s8.2 9.1 14.4 9.1l63.7 0 38.4 0 24.9 0 16 0 88 0c5.9 0 11.4-3.3 14.1-8.6s2.4-11.6-1-16.5l-79-112.6zM160 144a32 32 0 1 0 0 64 32 32 0 1 0 0-64z"/></svg>';

const LAYOUT_OPTIONS = [
  { value: 'padded', label: 'Padded (matches row)' },
  { value: 'bleed', label: 'Side-to-side (full bleed)' },
];

const WIDTH_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: '25%', label: '25%' },
  { value: '50%', label: '50%' },
  { value: '75%', label: '75%' },
  { value: '100%', label: '100% of container' },
];

// Border-radius widget is registered inside the iframe via
// registerPropertyEditor. Built-in Unlayer widgets don't expose a per-corner
// toggle for radius, so we ship a small custom one that mirrors the native
// padding widget's "All sides / More options" UX.

export function buildBrandedImageCustomJS(ctx: BuildContext, position: number): string {
  const VERSION = Date.now();

  // Container padding sourced from the policy (compliance.json → tools.branded_image.containerPadding).
  // "Padded" layout uses this value; "Side-to-side" sets it to 0 to flush against the column edges.
  const POLICY_PADDING = ctx.tools.branded_image?.containerPadding ?? '20px 20px 20px 20px';

  const SCRIPT =
    '(function(){\n' +
    'console.log("[branded_image] customJS loaded v=' + VERSION + '");\n' +
    '// Register a custom property-editor widget that renders an actual <button>.\n' +
    '// `unlayer.registerPropertyEditor` is the documented API for adding\n' +
    '// non-standard widgets to custom tool option panels.\n' +
    '// One-time document-level click delegation: buttons emit data-shaman-action.\n' +
    'if(!window.__shamanBrandedImageDelegation){\n' +
    '  document.addEventListener("click",function(e){\n' +
    '    var t=e.target;\n' +
    '    while(t&&t.getAttribute){\n' +
    '      var action=t.getAttribute("data-shaman-action");\n' +
    '      if(action){\n' +
    '        e.preventDefault();e.stopPropagation();\n' +
    '        try{parent.postMessage({type:"shaman:branded-image-action",action:action},"*");}catch(_){}\n' +
    '        try{window.postMessage({type:"shaman:branded-image-action",action:action},"*");}catch(_){}\n' +
    '        return;\n' +
    '      }\n' +
    '      t=t.parentNode;\n' +
    '    }\n' +
    '  },true);\n' +
    '  window.__shamanBrandedImageDelegation=true;\n' +
    '}\n' +
    'if(unlayer.registerPropertyEditor){\n' +
    '  // CTA button widget — render returns an HTML string; click handled via\n' +
    '  // document-level delegation above.\n' +
    '  unlayer.registerPropertyEditor({\n' +
    '    name:"library_button",\n' +
    '    layout:"bottom",\n' +
    '    Widget:unlayer.createWidget({\n' +
    '      render:function(value,updateValue,data){\n' +
    '        var label=(data&&data.label)||"Open";\n' +
    '        var variant=(data&&data.variant)||"primary";\n' +
    '        var action=(data&&data.action)||"";\n' +
    '        var bg=variant==="ghost"?"#fff":"#00A66F";\n' +
    '        var fg=variant==="ghost"?"#323232":"#fff";\n' +
    '        var border=variant==="ghost"?"1px solid #D9D9D9":"0";\n' +
    '        return \'<button type="button" data-shaman-action="\'+action+\'" style="display:block;width:100%;padding:10px 16px;background:\'+bg+\';color:\'+fg+\';border:\'+border+\';border-radius:4px;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit;text-align:center;">\'+label+\'</button>\';\n' +
    '      }\n' +
    '    })\n' +
    '  });\n' +
    '  // Corner radius widget — single-value or 2x2 per-corner inputs.\n' +
    '  if(!window.__shamanCornerRadiusInit){\n' +
    '    window.__shamanCornerRadiusCallbacks = window.__shamanCornerRadiusCallbacks || {};\n' +
    '    document.addEventListener("change",function(e){\n' +
    '      var t=e.target;\n' +
    '      var widgetId=t&&t.getAttribute&&t.getAttribute("data-shaman-corner-widget");\n' +
    '      if(!widgetId)return;\n' +
    '      var c=document.querySelector(\'[data-shaman-corner-id="\'+widgetId+\'"]\');\n' +
    '      if(!c)return;\n' +
    '      var mode=c.getAttribute("data-shaman-corner-mode");\n' +
    '      var val;\n' +
    '      if(mode==="all"){var v=(c.querySelector(\'input[data-corner="all"]\')||{}).value||"0";val=v+"px";}\n' +
    '      else{\n' +
    '        var tl=(c.querySelector(\'input[data-corner="tl"]\')||{}).value||"0";\n' +
    '        var tr=(c.querySelector(\'input[data-corner="tr"]\')||{}).value||"0";\n' +
    '        var br=(c.querySelector(\'input[data-corner="br"]\')||{}).value||"0";\n' +
    '        var bl=(c.querySelector(\'input[data-corner="bl"]\')||{}).value||"0";\n' +
    '        val=tl+"px "+tr+"px "+br+"px "+bl+"px";\n' +
    '      }\n' +
    '      var cb=window.__shamanCornerRadiusCallbacks[widgetId];\n' +
    '      if(cb)cb(val);\n' +
    '    },true);\n' +
    '    document.addEventListener("click",function(e){\n' +
    '      var t=e.target;\n' +
    '      var widgetId=t&&t.getAttribute&&t.getAttribute("data-shaman-corner-toggle");\n' +
    '      if(!widgetId)return;\n' +
    '      e.preventDefault();e.stopPropagation();\n' +
    '      var c=document.querySelector(\'[data-shaman-corner-id="\'+widgetId+\'"]\');\n' +
    '      if(!c)return;\n' +
    '      var mode=c.getAttribute("data-shaman-corner-mode");\n' +
    '      var cb=window.__shamanCornerRadiusCallbacks[widgetId];\n' +
    '      if(!cb)return;\n' +
    '      if(mode==="all"){\n' +
    '        var v=(c.querySelector(\'input[data-corner="all"]\')||{}).value||"0";\n' +
    '        cb(v+"px "+v+"px "+v+"px "+v+"px");\n' +
    '      }else{\n' +
    '        var v=(c.querySelector(\'input[data-corner="tl"]\')||{}).value||"0";\n' +
    '        cb(v+"px");\n' +
    '      }\n' +
    '    },true);\n' +
    '    window.__shamanCornerRadiusInit=true;\n' +
    '  }\n' +
    '  unlayer.registerPropertyEditor({\n' +
    '    name:"corner_radius",\n' +
    '    layout:"bottom",\n' +
    '    Widget:unlayer.createWidget({\n' +
    '      render:function(value){\n' +
    '        var widgetId="cr_"+Math.random().toString(36).slice(2,10);\n' +
    '        window.__shamanCornerRadiusCallbacks[widgetId]=arguments[1];\n' +
    '        var parts=String(value||"0").replace(/px/g,"").split(/\\s+/).filter(Boolean);\n' +
    '        var tl,tr,br,bl;\n' +
    '        if(parts.length<=1){tl=tr=br=bl=parts[0]||"0";}\n' +
    '        else if(parts.length===2){tl=br=parts[0];tr=bl=parts[1];}\n' +
    '        else if(parts.length===3){tl=parts[0];tr=bl=parts[1];br=parts[2];}\n' +
    '        else{tl=parts[0];tr=parts[1];br=parts[2];bl=parts[3];}\n' +
    '        var mode=parts.length<=1?"all":"sides";\n' +
    '        var inputCss="width:100%;padding:4px 8px;border:1px solid #D9D9D9;border-radius:4px;font:inherit;font-size:13px;text-align:center;box-sizing:border-box;";\n' +
    '        var labelCss="font-size:11px;color:#6b6f72;display:block;margin-bottom:4px;text-align:center;";\n' +
    '        var h=\'<div data-shaman-corner-id="\'+widgetId+\'" data-shaman-corner-mode="\'+mode+\'">\';\n' +
    '        h+=\'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">\';\n' +
    '        h+=\'<span style="font-size:11px;color:#6b6f72;">\'+(mode==="all"?"All sides":"Per corner")+\'</span>\';\n' +
    '        h+=\'<a href="#" data-shaman-corner-toggle="\'+widgetId+\'" style="font-size:11px;color:#00A66F;text-decoration:none;cursor:pointer;">\'+(mode==="all"?"More options":"Less options")+\'</a>\';\n' +
    '        h+=\'</div>\';\n' +
    '        if(mode==="all"){\n' +
    '          h+=\'<div style="display:flex;align-items:center;gap:6px;">\';\n' +
    '          h+=\'<input type="number" min="0" max="200" value="\'+tl+\'" data-shaman-corner-widget="\'+widgetId+\'" data-corner="all" style="\'+inputCss+\'" />\';\n' +
    '          h+=\'<span style="font-size:11px;color:#6b6f72;">px</span>\';\n' +
    '          h+=\'</div>\';\n' +
    '        }else{\n' +
    '          h+=\'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">\';\n' +
    '          var corners=[["tl","Top L",tl],["tr","Top R",tr],["bl","Bot L",bl],["br","Bot R",br]];\n' +
    '          for(var i=0;i<corners.length;i++){\n' +
    '            var c=corners[i];\n' +
    '            h+=\'<div><span style="\'+labelCss+\'">\'+c[1]+\'</span>\';\n' +
    '            h+=\'<input type="number" min="0" max="200" value="\'+c[2]+\'" data-shaman-corner-widget="\'+widgetId+\'" data-corner="\'+c[0]+\'" style="\'+inputCss+\'" /></div>\';\n' +
    '          }\n' +
    '          h+=\'</div>\';\n' +
    '        }\n' +
    '        h+=\'</div>\';\n' +
    '        return h;\n' +
    '      }\n' +
    '    })\n' +
    '  });\n' +
    '  // Library picker — small inline thumbnail (only when picked) + primary\n' +
    '  // "Select from visual library" button + bin icon for clear. Single row.\n' +
    '  unlayer.registerPropertyEditor({\n' +
    '    name:"library_picker",\n' +
    '    layout:"bottom",\n' +
    '    Widget:unlayer.createWidget({\n' +
    '      render:function(value){\n' +
    '        var url=(value&&value.url)||"";\n' +
    '        var thumb=url?\'<div style="width:48px;height:36px;flex-shrink:0;border:1px solid #D9D9D9;border-radius:4px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#fff;"><img src="\'+url+\'" alt="" style="max-width:100%;max-height:100%;object-fit:contain;" /></div>\':"";\n' +
    '        var btn=\'<button type="button" data-shaman-action="open" style="flex:1;min-width:0;padding:8px 12px;background:#00A66F;color:#fff;border:0;border-radius:4px;font-weight:500;font-size:13px;cursor:pointer;font-family:inherit;text-align:center;">Select from visual library</button>\';\n' +
    '        var bin=url?\'<button type="button" data-shaman-action="clear" title="Clear selection" style="flex-shrink:0;width:36px;height:36px;background:#fff;color:#6b6f72;border:1px solid #D9D9D9;border-radius:4px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;padding:0;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>\':"";\n' +
    '        return \'<div style="display:flex;gap:8px;align-items:center;">\'+thumb+btn+bin+\'</div>\';\n' +
    '      }\n' +
    '    })\n' +
    '  });\n' +
    '}\n' +
    'var PLACEHOLDER_URL = ' + JSON.stringify(SHAMAN_PLACEHOLDER_URL) + ';\n' +
    'var POLICY_PADDING = ' + JSON.stringify(POLICY_PADDING) + ';\n' +
    'function renderHtml(values){\n' +
    '  var url=(values&&values.assetUrl)||PLACEHOLDER_URL;\n' +
    '  var alt=(values&&values.alt)||"";\n' +
    '  var width=(values&&values.width)||"auto";\n' +
    '  var radius=(values&&values.borderRadius)||"0px";\n' +
    '  var layout=(values&&values.layout)||"padded";\n' +
    '  var linkAction=values&&values.linkAction;\n' +
    '  var href=(linkAction&&linkAction.values&&linkAction.values.href)||"";\n' +
    '  var target=(linkAction&&linkAction.values&&linkAction.values.target)||"_blank";\n' +
    '  var widthCss=width==="auto"?"":(\'width:\'+width+\';\');\n' +
    '  var radiusEmpty=!radius||radius==="0px"||/^0(px)?(\\s+0(px)?){0,3}$/.test(String(radius).trim());\n' +
    '  var imgStyle=\'display:block;max-width:100%;height:auto;border:0;margin:0 auto;\'+widthCss+(radiusEmpty?\'\':\'border-radius:\'+radius+\';\');\n' +
    '  var img=\'<img src="\'+url+\'" alt="\'+alt+\'" style="\'+imgStyle+\'" />\';\n' +
    '  if(href){var relAttr=target==="_blank"?\' rel="noopener"\':\'\';img=\'<a href="\'+href+\'" target="\'+target+\'"\'+relAttr+\' style="display:block;">\'+img+\'</a>\';}\n' +
    '  // Padded → policy padding around the image; Side-to-side → 0 padding.\n' +
    '  var pad=layout==="bleed"?"0":POLICY_PADDING;\n' +
    '  return \'<div style="padding:\'+pad+\';text-align:center;">\'+img+\'</div>\';\n' +
    '}\n' +
    '// Bridge to the React host: open Visual Library / report layout change.\n' +
    'function postToHost(msg){\n' +
    '  try{ parent.postMessage(msg, "*"); }catch(e){}\n' +
    '  try{ window.postMessage(msg, "*"); }catch(e){}\n' +
    '}\n' +
    '// Selection events come back via window message from the host.\n' +
    'var pendingValues=null;\n' +
    'var pendingUpdate=null;\n' +
    'window.addEventListener("message",function(e){\n' +
    '  var d=e.data||{};\n' +
    '  if(d.type==="shaman:visual-library-selected"&&pendingUpdate){\n' +
    '    pendingUpdate({assetUrl:d.url,assetId:String(d.id||""),assetName:d.name||"",alt:d.name||""});\n' +
    '    pendingUpdate=null;\n' +
    '  }\n' +
    '});\n' +
    'unlayer.registerTool({\n' +
    '  name:"branded_image",\n' +
    '  label:"Branded image",\n' +
    '  icon:' + JSON.stringify(IMAGE_SVG) + ',\n' +
    '  position:' + position + ',\n' +
    '  supportedDisplayModes:["email","web"],\n' +
    '  css:".u_content_custom_branded_image{padding:0 !important;}",\n' +
    '  options:{\n' +
    '    image:{title:"Image",position:1,options:{\n' +
    '      _library:{label:" ",defaultValue:{url:"",name:""},widget:"library_picker"},\n' +
    '      alt:{label:"Alt text",defaultValue:"",widget:"text"}\n' +
    '    }},\n' +
    '    action:{title:"Action",position:2,options:{\n' +
    '      linkAction:{label:"Image Link",widget:"link",defaultValue:{name:"web",values:{href:"",target:"_blank"}}}\n' +
    '    }},\n' +
    '    style:{title:"Style",position:3,options:{\n' +
    '      layout:{label:"Layout",defaultValue:"padded",widget:"dropdown",data:{options:' + JSON.stringify(LAYOUT_OPTIONS) + '}},\n' +
    '      textAlign:{label:"Align",defaultValue:"center",widget:"alignment"},\n' +
    '      width:{label:"Width",defaultValue:"auto",widget:"dropdown",data:{options:' + JSON.stringify(WIDTH_OPTIONS) + '}},\n' +
    '      borderRadius:{label:"Border radius",defaultValue:"0px",widget:"border_radius"}\n' +
    '    }}\n' +
    '  },\n' +
    '  values:{},\n' +
    '  transformer:function(values,source){\n' +
    '    if(!source||!source.name)return values;\n' +
    '    var newValues=Object.assign({},values);\n' +
    '    // Button-triggered actions arrive via postMessage; the property\n' +
    '    // editor button posts {type:"shaman:branded-image-action", action}.\n' +
    '    // The host forwards "open" to the Visual Library modal and bounces\n' +
    '    // "clear" back here to wipe the asset fields. Layout (padded/bleed)\n' +
    '    // controls the image\'s own containerPadding — no row mutation needed.\n' +
    '    return newValues;\n' +
    '  },\n' +
    '  renderer:{\n' +
    '    Viewer:unlayer.createViewer({render:function(values){return renderHtml(values);}}),\n' +
    '    exporters:{\n' +
    '      web:function(values){return renderHtml(values);},\n' +
    '      email:function(values){return renderHtml(values);}\n' +
    '    },\n' +
    '    head:{css:function(){return"";},js:function(){return"";}}\n' +
    '  }\n' +
    '});\n' +
    '})();';

  return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(SCRIPT) + '#v=' + VERSION;
}
