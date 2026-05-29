// Custom Unlayer tool: "Legal footer"
// Logo resolved from BDS by tag; elements driven by KB variants; approval
// code resolved from MLR document (or fallback placeholder).
import type { LegalFooterBlock, BuildContext, Variant } from '../policy/compliance';
import { filterVariantsByProduct } from '../policy/compliance';
import { RENDER_HELPERS_JS } from './render-helpers';
import { buildElementSection } from './build-element-section';
import { fetchAssetsByTag, type BdsAssetLegacy } from '../policy/bds-mock';
import { resolveApprovalCode } from '../policy/mlr-mock';

const LOCK_SVG =
  '<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="lock" class="svg-inline--fa fa-lock fa-3x" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M128 128l0 64 192 0 0-64c0-53-43-96-96-96s-96 43-96 96zM96 192l0-64C96 57.3 153.3 0 224 0s128 57.3 128 128l0 64 16 0c44.2 0 80 35.8 80 80l0 160c0 44.2-35.8 80-80 80L80 512c-44.2 0-80-35.8-80-80L0 272c0-44.2 35.8-80 80-80l16 0zM32 272l0 160c0 26.5 21.5 48 48 48l288 0c26.5 0 48-21.5 48-48l0-160c0-26.5-21.5-48-48-48L80 224c-26.5 0-48 21.5-48 48z"/></svg>';

export function buildLegalFooterCustomJS(block: LegalFooterBlock, ctx: BuildContext): string {
  const elements = [...block.elements].sort((a, b) => a.displayOrder - b.displayOrder);
  const VERSION = Date.now();

  const variantsById: Record<string, Variant[]> = {};
  const defaultsById: Record<string, string> = {};
  for (const el of elements) {
    const visible = filterVariantsByProduct(el.variants, ctx.contextProduct).sort((a, b) => a.order - b.order);
    variantsById[el.id] = visible;
    defaultsById[el.id] = visible.find((v) => v.id === el.defaultVariantId)?.id ?? visible[0]?.id ?? el.defaultVariantId;
  }

  // BDS logo lookup (mock for now)
  const logoAssets: BdsAssetLegacy[] = block.logo.enabled ? fetchAssetsByTag(block.logo.assetTag) : [];
  const logoAssetMap: Record<string, string> = Object.fromEntries(logoAssets.map((a) => [a.id, a.url]));
  const logoOptions = logoAssets.map((a) => ({ value: a.id, label: a.label }));

  const resolvedApprovalCode = block.approvalCode.enabled
    ? resolveApprovalCode(block.approvalCode.mlrDocumentId) || block.approvalCode.fallbackPlaceholder
    : null;

  const sections = elements.map((el, i) => buildElementSection(el, i + 2, `${i + 2}. `, ctx)); // +2 since logo is position 1
  const elementOptionsJs = sections.map((s) => s.optionsJs).join(',\n');
  const propertyStatesJs = sections.map((s) => s.propertyStatesEntry).join(',\n');
  const transformerJs = sections.map((s) => s.transformerBranches).join('\n');

  const logoSectionJs = block.logo.enabled
    ? '    logo:{title:"1. Logo (BDS)",position:1,options:{\n' +
      '      logoAssetId:{label:"Asset (tag: ' + block.logo.assetTag + ')",defaultValue:' + JSON.stringify(block.logo.assetId) + ',widget:"dropdown",data:{options:' + JSON.stringify(logoOptions) + '}},\n' +
      '      logoWidth:{label:"Width (px)",defaultValue:' + JSON.stringify(block.logo.width) + ',widget:"text"}\n' +
      '    }},\n'
    : '';

  const approvalSectionJs = block.approvalCode.enabled
    ? '    approval:{title:' + (resolvedApprovalCode === block.approvalCode.fallbackPlaceholder
        ? '"Approval Code (pending MLR)"'
        : '"Approval Code (from MLR)"') + ',position:90,options:{\n' +
      '      _info:{label:"Read-only",defaultValue:' + JSON.stringify(resolvedApprovalCode) + ',widget:"text"}\n' +
      '    }},\n'
    : '';

  const SCRIPT =
    '(function(){\n' +
    'console.log("[legal_footer] customJS loaded v=' + VERSION + '");\n' +
    RENDER_HELPERS_JS +
    'var ELEMENTS = ' + JSON.stringify(elements) + ';\n' +
    'var VARIANTS = ' + JSON.stringify(variantsById) + ';\n' +
    'var DEFAULTS = ' + JSON.stringify(defaultsById) + ';\n' +
    'var DOC_DEFAULTS = ' + JSON.stringify(ctx.documentDefaults) + ';\n' +
    'var BLOCK_LAYOUT = ' + JSON.stringify(block.layout || {}) + ';\n' +
    'var BLOCK_CONTAINER = ' + JSON.stringify(block.container || {}) + ';\n' +
    'var DOC_CONTAINER = ' + JSON.stringify(ctx.documentContainer) + ';\n' +
    'var SLOT_STYLES = ' + JSON.stringify(block.slotStyles || {}) + ';\n' +
    'var LINK_CONFIG = ' + JSON.stringify(ctx.linkConfig) + ';\n' +
    'var LOGO_URL_MAP = ' + JSON.stringify(logoAssetMap) + ';\n' +
    'var LOGO_ALT = ' + JSON.stringify(block.logo.alt) + ';\n' +
    'var LOGO_SPACING = ' + JSON.stringify(block.logo.spacing || {}) + ';\n' +
    'var LOGO_ENABLED = ' + JSON.stringify(block.logo.enabled) + ';\n' +
    'var APPROVAL_CODE = ' + JSON.stringify(resolvedApprovalCode) + ';\n' +
    'var APPROVAL_LAYOUT = ' + JSON.stringify(block.approvalCode.layout || {}) + ';\n' +
    'var APPROVAL_SPACING = ' + JSON.stringify(block.approvalCode.spacing || {}) + ';\n' +
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
    '  var fontFamily=outerLayout.fontFamily||"";\n' +
    '  var fontSize=values.fontSize||outerLayout.fontSize||"";\n' +
    '  var color=values.color||outerLayout.color||"";\n' +
    '  var lineHeight=outerLayout.lineHeight||"";\n' +
    '  var textAlign=values.textAlign||outerLayout.textAlign||"";\n' +
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
    '  if(LOGO_ENABLED){\n' +
    '    var assetId=(values&&values.logoAssetId)||"";\n' +
    '    var url=LOGO_URL_MAP[assetId]||"";\n' +
    '    var w=(values&&values.logoWidth)||"180";\n' +
    '    if(url){\n' +
    '      var mb=LOGO_SPACING.marginBottom||"16px";\n' +
    '      html+=\'<div style="margin-bottom:\'+mb+\';"><img src="\'+url+\'" alt="\'+LOGO_ALT+\'" width="\'+w+\'" style="display:inline-block;max-width:100%;height:auto;border:0;" /></div>\';\n' +
    '    }\n' +
    '  }\n' +
    '  for(var i=0;i<ELEMENTS.length;i++){html+=shamanRenderElement(ELEMENTS[i],values);}\n' +
    '  if(APPROVAL_CODE){\n' +
    '    var apMerged=shamanMergeLayout(DOC_DEFAULTS,BLOCK_LAYOUT,APPROVAL_LAYOUT,APPROVAL_SPACING);\n' +
    '    var apCss=shamanLayoutCss(apMerged)+shamanSpacingCss(apMerged,null);\n' +
    '    html+=\'<div style="\'+apCss+\'">\'+APPROVAL_CODE+\'</div>\';\n' +
    '  }\n' +
    '  html+=\'</div>\';\n' +
    '  return html;\n' +
    '}\n' +
    'unlayer.registerTool({\n' +
    '  name:"legal_footer",\n' +
    '  label:' + JSON.stringify(block.label) + ',\n' +
    '  icon:' + JSON.stringify(LOCK_SVG) + ',\n' +
    '  position:' + block.position + ',\n' +
    '  supportedDisplayModes:["email","web"],\n' +
    '  css:".u_content_custom_legal_footer{padding:0 !important;background:transparent !important;}",\n' +
    '  options:{\n' +
    logoSectionJs +
    elementOptionsJs + ',\n' +
    approvalSectionJs +
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
