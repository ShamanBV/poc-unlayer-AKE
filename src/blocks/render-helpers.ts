// Shared JS helpers embedded into every block's data: URL script.
// Kept as a JS string (not a TS function) because each Unlayer customJS runs
// in iframe isolation and must be self-contained.

export const RENDER_HELPERS_JS =
  'function shamanSmartJoin(uri, suffix){\n' +
  '  if(!suffix||!uri)return uri;\n' +
  '  var sfx=suffix;\n' +
  '  if(uri.indexOf("?")>=0){if(sfx.charAt(0)==="?")sfx="&"+sfx.substring(1);}\n' +
  '  else{if(sfx.charAt(0)==="&")sfx="?"+sfx.substring(1);}\n' +
  '  return uri+sfx;\n' +
  '}\n' +
  'function shamanRenderPlaceholder(p, linkConfig){\n' +
  '  var anchor=p.anchorText||"";\n' +
  '  var uri=p.uri||"";\n' +
  '  if(p.kind==="plain")return anchor;\n' +
  '  if(p.kind==="email_link")return \'<a href="mailto:\'+uri+\'">\'+anchor+\'</a>\';\n' +
  '  if(p.kind==="merge_field")return \'<a href="\'+uri+\'">\'+anchor+\'</a>\';\n' +
  '  // external_link (default): apply UTM suffix and open in new tab\n' +
  '  var href=shamanSmartJoin(uri,(linkConfig&&linkConfig.hrefSuffix)||"");\n' +
  '  return \'<a href="\'+href+\'" target="_blank" rel="noopener">\'+anchor+\'</a>\';\n' +
  '}\n' +
  'function shamanResolveTokens(text, placeholders, linkConfig){\n' +
  '  if(!text)return"";\n' +
  '  var arr=placeholders||[];\n' +
  '  for(var i=0;i<arr.length;i++){\n' +
  '    var p=arr[i];\n' +
  '    var token="{{"+p.key+"}}";\n' +
  '    var html=shamanRenderPlaceholder(p,linkConfig);\n' +
  '    text=text.split(token).join(html);\n' +
  '  }\n' +
  '  return text;\n' +
  '}\n' +
  'function shamanMergeLayout(){\n' +
  '  var out={};\n' +
  '  for(var i=0;i<arguments.length;i++){\n' +
  '    var src=arguments[i]||{};\n' +
  '    for(var k in src){if(src[k]!==undefined&&src[k]!==null&&src[k]!=="")out[k]=src[k];}\n' +
  '  }\n' +
  '  return out;\n' +
  '}\n' +
  'function shamanLayoutCss(layout){\n' +
  '  var s="";\n' +
  '  if(layout.fontFamily)s+="font-family:"+layout.fontFamily+";";\n' +
  '  if(layout.fontSize)s+="font-size:"+layout.fontSize+";";\n' +
  '  if(layout.fontWeight)s+="font-weight:"+layout.fontWeight+";";\n' +
  '  if(layout.color)s+="color:"+layout.color+";";\n' +
  '  if(layout.lineHeight)s+="line-height:"+layout.lineHeight+";";\n' +
  '  if(layout.textAlign)s+="text-align:"+layout.textAlign+";";\n' +
  '  return s;\n' +
  '}\n' +
  'function shamanSpacingCss(layout,spacing){\n' +
  '  var s="";\n' +
  '  var mt=(spacing&&spacing.marginTop)||layout.marginTop;\n' +
  '  var mb=(spacing&&spacing.marginBottom)||layout.marginBottom;\n' +
  '  if(mt)s+="margin-top:"+mt+";";\n' +
  '  if(mb)s+="margin-bottom:"+mb+";";\n' +
  '  return s;\n' +
  '}\n' +
  'function shamanContainerCss(c){\n' +
  '  if(!c)return"";\n' +
  '  var s="";\n' +
  '  if(c.backgroundColor)s+="background-color:"+c.backgroundColor+";";\n' +
  '  if(c.padding)s+="padding:"+c.padding+";";\n' +
  '  if(c.marginTop)s+="margin-top:"+c.marginTop+";";\n' +
  '  if(c.border){\n' +
  '    var b=c.border;\n' +
  '    if(b.width&&b.width!=="0px"&&b.width!=="0")s+="border:"+b.width+" "+(b.style||"solid")+" "+(b.color||"#000")+";";\n' +
  '    if(b.radius&&b.radius!=="0px"&&b.radius!=="0")s+="border-radius:"+b.radius+";";\n' +
  '  }\n' +
  '  return s;\n' +
  '}\n' +
  'var SHAMAN_CUSTOM = "__custom__";\n' +
  'var SHAMAN_RESET = "__reset__";\n' +
  'function shamanVariantLabel(v){\n' +
  '  var note=v.note||"";\n' +
  '  var noteShort=note.length>25?note.substring(0,25)+"…":note;\n' +
  '  var depTag=v.deprecated?" [dep]":"";\n' +
  '  var ct=v.count?" (×"+v.count+")":"";\n' +
  '  return "v"+v.order+(noteShort?" — "+noteShort:"")+ct+depTag;\n' +
  '}\n' +
  'function shamanFindVariant(variants,id){for(var i=0;i<variants.length;i++){if(variants[i].id===id)return variants[i];}return null;}\n';
