// Custom Unlayer tool: "Preview disclosures"
// Renders the policy's `elements` array. Each element is resolved through
// the brand-cascade + language-pick (see resolveElement) before reaching the
// factory, so `variants` already contains language-resolved strings.
import type { BlockBase, BuildContext, ResolvedVariant, ResolvedElement } from '../policy/compliance';
import { resolveElement } from '../policy/compliance';
import { RENDER_HELPERS_JS } from './render-helpers';
import { buildElementSection } from './build-element-section';

const MEGAPHONE_SVG =
  '<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="megaphone" class="svg-inline--fa fa-megaphone fa-3x" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M560 32c-8.8 0-16 7.2-16 16l0 11.5L32 187.5 32 176c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 19.5L0 208l0 96 0 12.5L0 336c0 8.8 7.2 16 16 16s16-7.2 16-16l0-11.5 131.7 32.9c-2.4 8.4-3.7 17.4-3.7 26.6c0 53 43 96 96 96c46.2 0 84.7-32.6 93.9-76L544 452.5l0 11.5c0 8.8 7.2 16 16 16s16-7.2 16-16l0-24 0-368 0-24c0-8.8-7.2-16-16-16zM544 419.5L32 291.5l0-71 512-128 0 327zM192 384c0-6.5 1-12.9 2.8-18.8l124 31C313.1 425.7 287.2 448 256 448c-35.3 0-64-28.7-64-64z"/></svg>';

export function buildPreviewDisclosuresCustomJS(block: BlockBase, ctx: BuildContext): string {
  const sourceElements = [...block.elements].sort((a, b) => a.order - b.order);
  const elements: ResolvedElement[] = sourceElements.map((el) =>
    resolveElement(el, 'preview_disclosures', ctx.selectedBrand, ctx.language),
  );
  const VERSION = Date.now();

  const variantsById: Record<string, ResolvedVariant[]> = {};
  const defaultsById: Record<string, string> = {};
  for (const el of elements) {
    variantsById[el.id] = el.variants;
    defaultsById[el.id] = el.defaultVariantId;
  }

  const sections = elements.map((el, i) => buildElementSection(el, i + 1, `${i + 1}. `));
  const elementOptionsJs = sections.map((s) => s.optionsJs).join(',\n');
  const propertyStatesJs = sections.map((s) => s.propertyStatesEntry).join(',\n');
  const transformerJs = sections.map((s) => s.transformerBranches).join('\n');

  const SCRIPT =
    '(function(){\n' +
    'console.log("[preview_disclosures] customJS loaded v=' + VERSION + '");\n' +
    RENDER_HELPERS_JS +
    'var ELEMENTS = ' + JSON.stringify(elements) + ';\n' +
    'var VARIANTS = ' + JSON.stringify(variantsById) + ';\n' +
    'var DEFAULTS = ' + JSON.stringify(defaultsById) + ';\n' +
    'var DOC_DEFAULTS = ' + JSON.stringify(ctx.documentDefaults) + ';\n' +
    'var BLOCK_LAYOUT = ' + JSON.stringify(block.layout || {}) + ';\n' +
    'var BLOCK_CONTAINER = ' + JSON.stringify(block.container || {}) + ';\n' +
    'var DOC_CONTAINER = ' + JSON.stringify(ctx.documentContainer) + ';\n' +
    'var SLOT_STYLES = ' + JSON.stringify(block.slotStyles || {}) + ';\n' +
    'var LINK_CONFIG = ' + JSON.stringify({}) + ';\n' +
    'var lastVariantIds = {};\n' +
    'function shamanRenderElement(el,values){\n' +
    '  var variantId=(values&&values[el.id+"_variantId"])||DEFAULTS[el.id];\n' +
    '  var content;\n' +
    '  if(variantId==="__custom__"){content=(values&&values[el.id+"_text"])||"";}\n' +
    '  else{var v=shamanFindVariant(VARIANTS[el.id],variantId);content=v?shamanResolveTokens(v.text,v.placeholders,LINK_CONFIG):"";}\n' +
    '  var slotStyle=SLOT_STYLES[el.slot]||{};\n' +
    '  var merged=shamanMergeLayout(DOC_DEFAULTS,BLOCK_LAYOUT,slotStyle,el.layout,el.spacing);\n' +
    '  var css=shamanLayoutCss(merged)+shamanSpacingCss(merged,null);\n' +
    '  return \'<div style="\'+css+\'">\'+content+\'</div>\';\n' +
    '}\n' +
    'function renderHtml(values){\n' +
    '  var outerLayout=shamanMergeLayout(DOC_DEFAULTS,BLOCK_LAYOUT);\n' +
    '  // Picker is the single source of truth — clear == transparent, no policy fallback.\n' +
    '  var bg=values.backgroundColor||"transparent";\n' +
    '  var padding=values.padding||BLOCK_CONTAINER.padding||DOC_CONTAINER.padding||"";\n' +
    '  var fontSize=values.fontSize||outerLayout.fontSize||"";\n' +
    '  var color=values.color||outerLayout.color||"";\n' +
    '  var textAlign=values.textAlign||outerLayout.textAlign||"";\n' +
    '  var fontFamily=outerLayout.fontFamily||"";\n' +
    '  var lineHeight=outerLayout.lineHeight||"";\n' +
    '  var s="";\n' +
    '  s+="background-color:"+bg+";";\n' +
    '  if(padding)s+="padding:"+padding+";";\n' +
    '  if(fontFamily)s+="font-family:"+fontFamily+";";\n' +
    '  if(fontSize)s+="font-size:"+fontSize+";";\n' +
    '  if(color)s+="color:"+color+";";\n' +
    '  if(lineHeight)s+="line-height:"+lineHeight+";";\n' +
    '  if(textAlign)s+="text-align:"+textAlign+";";\n' +
    '  s+=shamanContainerCss({border:BLOCK_CONTAINER.border||DOC_CONTAINER.border});\n' +
    '  var html=\'<div style="\'+s+\'">\';\n' +
    '  for(var i=0;i<ELEMENTS.length;i++){html+=shamanRenderElement(ELEMENTS[i],values);}\n' +
    '  html+=\'</div>\';\n' +
    '  return html;\n' +
    '}\n' +
    'unlayer.registerTool({\n' +
    '  name:"preview_disclosures",\n' +
    '  label:' + JSON.stringify(block.label) + ',\n' +
    '  icon:' + JSON.stringify(MEGAPHONE_SVG) + ',\n' +
    '  position:' + block.order + ',\n' +
    '  supportedDisplayModes:["email","web"],\n' +
    '  css:".u_content_custom_preview_disclosures{padding:0 !important;background:transparent !important;}",\n' +
    '  options:{\n' +
    elementOptionsJs + ',\n' +
    '    style:{title:"Style",position:99,options:{\n' +
    '      backgroundColor:{label:"Background colour",defaultValue:' + JSON.stringify(block.container?.backgroundColor ?? '') + ',widget:"color_picker",data:{mode:"CONTRAST"}},\n' +
    '      fontSize:{label:"Font size",defaultValue:' + JSON.stringify(block.layout?.fontSize ?? ctx.documentDefaults.fontSize ?? '') + ',widget:"font_size"},\n' +
    '      color:{label:"Text colour",widget:"color_picker",data:{mode:"CONTRAST"}},\n' +
    '      textAlign:{label:"Alignment",defaultValue:' + JSON.stringify(block.layout?.textAlign ?? ctx.documentDefaults.textAlign ?? '') + ',widget:"alignment"},\n' +
    '      padding:{label:"Padding",defaultValue:' + JSON.stringify(block.container?.padding ?? '') + ',widget:"padding"}\n' +
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
