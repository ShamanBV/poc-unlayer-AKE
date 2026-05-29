// Custom Unlayer tool: "Regulatory footer"
// Elements grouped into sub-containers via `slotRouting`. Variants
// dropdown per element from the KB; UTM suffix applied to external links.
import type { BlockBase, BuildContext, Variant } from '../policy/compliance';
import { filterVariantsByProduct } from '../policy/compliance';
import { RENDER_HELPERS_JS } from './render-helpers';
import { buildElementSection } from './build-element-section';

const CLIPBOARD_LIST_CHECK_SVG =
  '<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="clipboard-list-check" class="svg-inline--fa fa-clipboard-list-check fa-3x" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M145.5 68c5.3-20.7 24.1-36 46.5-36s41.2 15.3 46.5 36c1.8 7.1 8.2 12 15.5 12l18 0c8.8 0 16 7.2 16 16l0 32-96 0-96 0 0-32c0-8.8 7.2-16 16-16l18 0c7.3 0 13.7-4.9 15.5-12zM192 0c-32.8 0-61 19.8-73.3 48L112 48C91.1 48 73.3 61.4 66.7 80L64 80C28.7 80 0 108.7 0 144L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-304c0-35.3-28.7-64-64-64l-2.7 0c-6.6-18.6-24.4-32-45.3-32l-6.7 0C253 19.8 224.8 0 192 0zM320 112c17.7 0 32 14.3 32 32l0 304c0 17.7-14.3 32-32 32L64 480c-17.7 0-32-14.3-32-32l0-304c0-17.7 14.3-32 32-32l0 16c0 17.7 14.3 32 32 32l96 0 96 0c17.7 0 32-14.3 32-32l0-16zM208 80a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zM171.3 235.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L112 249.4 99.3 236.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l24 24c6.2 6.2 16.4 6.2 22.6 0l48-48zM192 272c0 8.8 7.2 16 16 16l64 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-64 0c-8.8 0-16 7.2-16 16zm-32 96c0 8.8 7.2 16 16 16l96 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-96 0c-8.8 0-16 7.2-16 16zm-48 24a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg>';

export function buildRegulatoryFooterCustomJS(block: BlockBase, ctx: BuildContext): string {
  const elements = [...block.elements].sort((a, b) => a.displayOrder - b.displayOrder);
  const VERSION = Date.now();

  const variantsById: Record<string, Variant[]> = {};
  const defaultsById: Record<string, string> = {};
  for (const el of elements) {
    const visible = filterVariantsByProduct(el.variants, ctx.contextProduct).sort((a, b) => a.order - b.order);
    variantsById[el.id] = visible;
    defaultsById[el.id] = visible.find((v) => v.id === el.defaultVariantId)?.id ?? visible[0]?.id ?? el.defaultVariantId;
  }

  const sections = elements.map((el, i) => buildElementSection(el, i + 1, `${i + 1}. `, ctx));
  const elementOptionsJs = sections.map((s) => s.optionsJs).join(',\n');
  const propertyStatesJs = sections.map((s) => s.propertyStatesEntry).join(',\n');
  const transformerJs = sections.map((s) => s.transformerBranches).join('\n');

  const SCRIPT =
    '(function(){\n' +
    'console.log("[regulatory_footer] customJS loaded v=' + VERSION + '");\n' +
    RENDER_HELPERS_JS +
    'var ELEMENTS = ' + JSON.stringify(elements) + ';\n' +
    'var VARIANTS = ' + JSON.stringify(variantsById) + ';\n' +
    'var DEFAULTS = ' + JSON.stringify(defaultsById) + ';\n' +
    'var DOC_DEFAULTS = ' + JSON.stringify(ctx.documentDefaults) + ';\n' +
    'var BLOCK_LAYOUT = ' + JSON.stringify(block.layout || {}) + ';\n' +
    'var BLOCK_CONTAINER = ' + JSON.stringify(block.container || {}) + ';\n' +
    'var DOC_CONTAINER = ' + JSON.stringify(ctx.documentContainer) + ';\n' +
    'var CONTAINERS = ' + JSON.stringify(block.containers || []) + ';\n' +
    'var SLOT_ROUTING = ' + JSON.stringify(block.slotRouting || {}) + ';\n' +
    'var SLOT_STYLES = ' + JSON.stringify(block.slotStyles || {}) + ';\n' +
    'var LINK_CONFIG = ' + JSON.stringify(ctx.linkConfig) + ';\n' +
    'var lastVariantIds = {};\n' +
    'function findContainer(cid){for(var i=0;i<CONTAINERS.length;i++){if(CONTAINERS[i].id===cid)return CONTAINERS[i];}return null;}\n' +
    'function shamanRenderElement(el,containerLayout,values){\n' +
    '  var variantId=(values&&values[el.id+"_variantId"])||DEFAULTS[el.id];\n' +
    '  var content;\n' +
    '  if(variantId==="__custom__"){content=(values&&values[el.id+"_text"])||"";}\n' +
    '  else{var v=shamanFindVariant(VARIANTS[el.id],variantId);content=v?shamanResolveTokens(v.text,v.placeholders,LINK_CONFIG):"";}\n' +
    '  var slotStyle=SLOT_STYLES[el.slot]||{};\n' +
    '  var merged=shamanMergeLayout(DOC_DEFAULTS,BLOCK_LAYOUT,containerLayout||{},slotStyle,el.layout,el.spacing);\n' +
    '  var css=shamanLayoutCss(merged)+shamanSpacingCss(merged,null);\n' +
    '  return \'<div style="\'+css+\'">\'+content+\'</div>\';\n' +
    '}\n' +
    'function renderHtml(values){\n' +
    '  var groups=[];\n' +
    '  var current=null;\n' +
    '  for(var i=0;i<ELEMENTS.length;i++){\n' +
    '    var el=ELEMENTS[i];\n' +
    '    var cid=SLOT_ROUTING[el.slot]||null;\n' +
    '    if(!current||current.id!==cid){\n' +
    '      var spec=cid?findContainer(cid):null;\n' +
    '      current={id:cid,layout:spec?(spec.layout||{}):{},container:spec?spec.container:null,elements:[]};\n' +
    '      groups.push(current);\n' +
    '    }\n' +
    '    current.elements.push(el);\n' +
    '  }\n' +
    '  var outerLayout=shamanMergeLayout(DOC_DEFAULTS,BLOCK_LAYOUT);\n' +
    '  var outerFf=outerLayout.fontFamily||"";\n' +
    '  var outerColor=outerLayout.color||"";\n' +
    '  // Picker is the single source of truth — clear == transparent, no policy fallback.\n' +
    '  var bg=values.backgroundColor||"transparent";\n' +
    '  var outerS="font-family:"+outerFf+";"+(outerColor?"color:"+outerColor+";":"")+"background-color:"+bg+";";\n' +
    '  var mergedBlockContainer={\n' +
    '    padding:BLOCK_CONTAINER.padding||DOC_CONTAINER.padding||"",\n' +
    '    border:BLOCK_CONTAINER.border||DOC_CONTAINER.border,\n' +
    '    marginTop:BLOCK_CONTAINER.marginTop||DOC_CONTAINER.marginTop||""\n' +
    '  };\n' +
    '  outerS+=shamanContainerCss(mergedBlockContainer);\n' +
    '  var html=\'<div style="\'+outerS+\'">\';\n' +
    '  for(var g=0;g<groups.length;g++){\n' +
    '    var grp=groups[g];\n' +
    '    if(grp.container){html+=\'<div style="\'+shamanContainerCss(grp.container)+\'">\';}\n' +
    '    for(var k=0;k<grp.elements.length;k++){html+=shamanRenderElement(grp.elements[k],grp.layout,values);}\n' +
    '    if(grp.container){html+=\'</div>\';}\n' +
    '  }\n' +
    '  html+=\'</div>\';\n' +
    '  return html;\n' +
    '}\n' +
    'unlayer.registerTool({\n' +
    '  name:"regulatory_footer",\n' +
    '  label:' + JSON.stringify(block.label) + ',\n' +
    '  icon:' + JSON.stringify(CLIPBOARD_LIST_CHECK_SVG) + ',\n' +
    '  position:' + block.position + ',\n' +
    '  supportedDisplayModes:["email","web"],\n' +
    '  css:".u_content_custom_regulatory_footer{padding:0 !important;background:transparent !important;}",\n' +
    '  options:{\n' +
    elementOptionsJs + ',\n' +
    '    style:{title:"Style",position:99,options:{\n' +
    '      backgroundColor:{label:"Background colour",defaultValue:' + JSON.stringify(block.container?.backgroundColor ?? '') + ',widget:"color_picker",data:{mode:"CONTRAST"}}\n' +
    '    }}\n' +
    '  },\n' +
    '  values:{},\n' +
    '  propertyStates:function(values){\n' +
    '    return {\n' +
    propertyStatesJs + '\n' +
    '    };\n' +
    '  },\n' +
    '  transformer:function(values,source){\n' +
    '    if(!source||!source.name)return values;\n' +
    '    var newValues=Object.assign({},values);\n' +
    transformerJs + '\n' +
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
