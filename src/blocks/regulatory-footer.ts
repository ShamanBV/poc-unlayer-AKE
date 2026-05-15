// Custom Unlayer tool: "Regulatory footer"
// Sits above the branded footer and renders four toggleable sections, each with
// a bold title and body, inside a black border by default:
//   1. Abbreviations
//   2. Contraindications
//   3. Safety Warnings
//   4. AE Reporting
//
// Same UX patterns as the Regulatory block: per-section dropdown with presets
// + "Custom override" + "No <section>"; custom text only shown when override
// is selected; transformer pre-fills custom text from the last preset.

export interface RegulatoryFooterPreset {
  id: string;
  label: string;
  text: string;
}

export const REGULATORY_FOOTER_PRESETS: Record<
  'abbreviations' | 'contraindications' | 'safetyWarnings' | 'aeReporting',
  RegulatoryFooterPreset[]
> = {
  abbreviations: [
    {
      id: 'scemblix-abbrev',
      label: 'SCEMBLIX',
      text:
        'AE = adverse event; CML = chronic myeloid leukaemia; CP = chronic phase; HCP = healthcare professional; PI = prescribing information; Ph+ = Philadelphia chromosome positive; T315I = threonine to isoleucine substitution at position 315; TKI = tyrosine kinase inhibitor.',
    },
    {
      id: 'fruzaqla-abbrev',
      label: 'Fruzaqla',
      text:
        'AE = adverse event; HCP = healthcare professional; mCRC = metastatic colorectal cancer; PI = prescribing information.',
    },
  ],
  contraindications: [
    {
      id: 'scemblix-cti',
      label: 'SCEMBLIX',
      text:
        'SCEMBLIX is contraindicated in patients with known hypersensitivity to asciminib or any of its excipients.',
    },
    {
      id: 'fruzaqla-cti',
      label: 'Fruzaqla',
      text:
        'Fruzaqla is contraindicated in patients with severe hepatic impairment or known hypersensitivity to fruquintinib.',
    },
  ],
  safetyWarnings: [
    {
      id: 'scemblix-warnings',
      label: 'SCEMBLIX',
      text:
        'Important safety information: SCEMBLIX may cause myelosuppression, hypertension, pancreatic toxicity, and cardiovascular toxicity. Monitor blood counts and signs/symptoms regularly.',
    },
    {
      id: 'fruzaqla-warnings',
      label: 'Fruzaqla',
      text:
        'Important warnings: Fruzaqla can cause hypertension, hepatotoxicity, infections, and embryo-fetal toxicity. Monitor patients regularly.',
    },
  ],
  aeReporting: [
    {
      id: 'uk-mhra-novartis',
      label: 'UK MHRA — Novartis',
      text:
        'Adverse events should be reported. Reporting forms and information can be found at <a href="https://www.mhra.gov.uk/yellowcard">www.mhra.gov.uk/yellowcard</a>. Adverse events should also be reported to Novartis online through the pharmacovigilance intake (PVI) tool at <a href="https://www.novartis.com/report">www.novartis.com/report</a> or alternatively email <a href="mailto:medinfo.uk@novartis.com">medinfo.uk@novartis.com</a> or call 01276 698370.',
    },
    {
      id: 'fda',
      label: 'US FDA MedWatch',
      text:
        'Adverse events should be reported to the FDA at 1-800-FDA-1088 or <a href="https://www.fda.gov/medwatch">www.fda.gov/medwatch</a>.',
    },
    {
      id: 'ema',
      label: 'EU EMA',
      text: 'Adverse events should be reported to your national reporting system.',
    },
  ],
};

const VERSION = Date.now();

const CLIPBOARD_LIST_CHECK_SVG =
  '<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="clipboard-list-check" class="svg-inline--fa fa-clipboard-list-check fa-3x" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M145.5 68c5.3-20.7 24.1-36 46.5-36s41.2 15.3 46.5 36c1.8 7.1 8.2 12 15.5 12l18 0c8.8 0 16 7.2 16 16l0 32-96 0-96 0 0-32c0-8.8 7.2-16 16-16l18 0c7.3 0 13.7-4.9 15.5-12zM192 0c-32.8 0-61 19.8-73.3 48L112 48C91.1 48 73.3 61.4 66.7 80L64 80C28.7 80 0 108.7 0 144L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-304c0-35.3-28.7-64-64-64l-2.7 0c-6.6-18.6-24.4-32-45.3-32l-6.7 0C253 19.8 224.8 0 192 0zM320 112c17.7 0 32 14.3 32 32l0 304c0 17.7-14.3 32-32 32L64 480c-17.7 0-32-14.3-32-32l0-304c0-17.7 14.3-32 32-32l0 16c0 17.7 14.3 32 32 32l96 0 96 0c17.7 0 32-14.3 32-32l0-16zM208 80a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zM171.3 235.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L112 249.4 99.3 236.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l24 24c6.2 6.2 16.4 6.2 22.6 0l48-48zM192 272c0 8.8 7.2 16 16 16l64 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-64 0c-8.8 0-16 7.2-16 16zm-32 96c0 8.8 7.2 16 16 16l96 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-96 0c-8.8 0-16 7.2-16 16zm-48 24a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg>';

const DEFAULT_BORDER =
  '{borderTopColor:"#000000",borderTopStyle:"solid",borderTopWidth:"1px",' +
  'borderBottomColor:"#000000",borderBottomStyle:"solid",borderBottomWidth:"1px",' +
  'borderLeftColor:"#000000",borderLeftStyle:"solid",borderLeftWidth:"1px",' +
  'borderRightColor:"#000000",borderRightStyle:"solid",borderRightWidth:"1px"}';

const SCRIPT =
  '(function(){\n' +
  'console.log("[regulatory_footer] customJS loaded v=' + VERSION + '");\n' +
  'var PRESETS = ' + JSON.stringify(REGULATORY_FOOTER_PRESETS) + ';\n' +
  'var CUSTOM = "__custom__";\n' +
  'var NONE = "__none__";\n' +
  'var NONE_LABELS = {abbreviations:"No abbreviations",contraindications:"No contraindications",safetyWarnings:"No safety warnings",aeReporting:"No AE reporting"};\n' +
  'var lastPreset = {abbreviations:"scemblix-abbrev",contraindications:"scemblix-cti",safetyWarnings:"scemblix-warnings",aeReporting:"uk-mhra-novartis"};\n' +
  'function presetOptions(group){var opts=PRESETS[group].map(function(p){return {value:p.id,label:p.label};});opts.push({value:CUSTOM,label:"Custom override"});opts.push({value:NONE,label:NONE_LABELS[group]});return opts;}\n' +
  'function findPreset(group,id){for(var i=0;i<PRESETS[group].length;i++){if(PRESETS[group][i].id===id)return PRESETS[group][i];}return null;}\n' +
  'function pickText(group,presetId,customHtml){if(presetId===NONE)return null;if(presetId===CUSTOM)return customHtml||"";var p=findPreset(group,presetId);return p?p.text:"";}\n' +
  'function borderCss(b){\n' +
  '  b=b||{};\n' +
  '  function side(name){return (b["border"+name+"Width"]||"0")+" "+(b["border"+name+"Style"]||"solid")+" "+(b["border"+name+"Color"]||"#000000");}\n' +
  '  return "border-top:"+side("Top")+";border-bottom:"+side("Bottom")+";border-left:"+side("Left")+";border-right:"+side("Right")+";";\n' +
  '}\n' +
  'function renderHtml(values){\n' +
  '  var fontSize=values.fontSize||"13px";\n' +
  '  var color=values.color||"";\n' +
  '  var textAlign=values.textAlign||"left";\n' +
  '  var bg=values.backgroundColor||"";\n' +
  '  var padding=values.padding||"24px 32px";\n' +
  '  var abbrFontSize=values.abbreviationsFontSize||"10px";\n' +
  '  var html=\'<div style="font-family:arial,helvetica,sans-serif;\'+(color?\'color:\'+color+\';\':\'\')+\'">\';\n' +
  '  // Box 1: Contraindications + Safety Warnings (bold, user-aligned)\n' +
  '  var box1Groups=["contraindications","safetyWarnings"];\n' +
  '  var visibleBox1=[];\n' +
  '  for(var i=0;i<box1Groups.length;i++){\n' +
  '    var g=box1Groups[i];\n' +
  '    var t=pickText(g,values[g+"Preset"],values[g+"Custom"]);\n' +
  '    if(t!==null)visibleBox1.push(t);\n' +
  '  }\n' +
  '  var box1Inner="";\n' +
  '  for(var j=0;j<visibleBox1.length;j++){\n' +
  '    var mb=j<visibleBox1.length-1?"14px":"0";\n' +
  '    box1Inner+=\'<div style="margin:0 0 \'+mb+\' 0;font-weight:bold;">\'+visibleBox1[j]+\'</div>\';\n' +
  '  }\n' +
  '  if(box1Inner){\n' +
  '    html+=\'<div style="\'+(bg?\'background-color:\'+bg+\';\':\'\')+\'padding:\'+padding+\';font-size:\'+fontSize+\';line-height:140%;text-align:\'+textAlign+\';\'+borderCss(values.border)+\'">\'+box1Inner+\'</div>\';\n' +
  '  }\n' +
  '  // Box 2: AE Reporting in its own bordered box (centered)\n' +
  '  var ae=pickText("aeReporting",values.aeReportingPreset,values.aeReportingCustom);\n' +
  '  if(ae!==null){\n' +
  '    var aeMarginTop=box1Inner?"12px":"0";\n' +
  '    html+=\'<div style="margin-top:\'+aeMarginTop+\';\'+(bg?\'background-color:\'+bg+\';\':\'\')+\'padding:\'+padding+\';font-size:\'+fontSize+\';line-height:140%;text-align:center;\'+borderCss(values.border)+\'">\'+ae+\'</div>\';\n' +
  '  }\n' +
  '  // Abbreviations: outside any box, smaller text\n' +
  '  var abbr=pickText("abbreviations",values.abbreviationsPreset,values.abbreviationsCustom);\n' +
  '  if(abbr!==null){\n' +
  '    var topMargin=(box1Inner||ae!==null)?"16px":"0";\n' +
  '    html+=\'<div style="margin:\'+topMargin+\' 0 0 0;font-size:\'+abbrFontSize+\';line-height:140%;text-align:\'+textAlign+\';">\'+abbr+\'</div>\';\n' +
  '  }\n' +
  '  html+=\'</div>\';\n' +
  '  return html;\n' +
  '}\n' +
  'unlayer.registerTool({\n' +
  '  name:"regulatory_footer",\n' +
  '  label:"Regulatory footer",\n' +
  '  icon:' + JSON.stringify(CLIPBOARD_LIST_CHECK_SVG) + ',\n' +
  '  position:2,\n' +
  '  supportedDisplayModes:["email","web"],\n' +
  '  css:".u_content_custom_regulatory_footer{padding:0 !important;}",\n' +
  '  options:{\n' +
  '    contraindications:{title:"Contraindications",position:1,options:{\n' +
  '      contraindicationsPreset:{label:"Content",defaultValue:"scemblix-cti",widget:"dropdown",data:{options:presetOptions("contraindications")}},\n' +
  '      contraindicationsCustom:{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
  '    }},\n' +
  '    safetyWarnings:{title:"Safety Warnings",position:2,options:{\n' +
  '      safetyWarningsPreset:{label:"Content",defaultValue:"scemblix-warnings",widget:"dropdown",data:{options:presetOptions("safetyWarnings")}},\n' +
  '      safetyWarningsCustom:{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
  '    }},\n' +
  '    aeReporting:{title:"AE Reporting",position:3,options:{\n' +
  '      aeReportingPreset:{label:"Content",defaultValue:"fda",widget:"dropdown",data:{options:presetOptions("aeReporting")}},\n' +
  '      aeReportingCustom:{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
  '    }},\n' +
  '    abbreviations:{title:"Abbreviations",position:4,options:{\n' +
  '      abbreviationsPreset:{label:"Content",defaultValue:"scemblix-abbrev",widget:"dropdown",data:{options:presetOptions("abbreviations")}},\n' +
  '      abbreviationsCustom:{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
  '    }},\n' +
  '    style:{title:"Style",position:5,options:{\n' +
  '      backgroundColor:{label:"Box background",widget:"color_picker",data:{mode:"CONTRAST"}},\n' +
  '      fontSize:{label:"Box font size",defaultValue:"13px",widget:"font_size"},\n' +
  '      abbreviationsFontSize:{label:"Abbreviations font size",defaultValue:"10px",widget:"font_size"},\n' +
  '      color:{label:"Text colour",widget:"color_picker",data:{mode:"CONTRAST"}},\n' +
  '      textAlign:{label:"Alignment",defaultValue:"left",widget:"alignment"},\n' +
  '      padding:{label:"Box padding",defaultValue:"24px 32px",widget:"padding"},\n' +
  '      border:{label:"Box border",defaultValue:' + DEFAULT_BORDER + ',widget:"border"}\n' +
  '    }}\n' +
  '  },\n' +
  '  values:{},\n' +
  '  propertyStates:function(values){\n' +
  '    return {\n' +
  '      abbreviationsCustom:{enabled:values.abbreviationsPreset===CUSTOM},\n' +
  '      contraindicationsCustom:{enabled:values.contraindicationsPreset===CUSTOM},\n' +
  '      safetyWarningsCustom:{enabled:values.safetyWarningsPreset===CUSTOM},\n' +
  '      aeReportingCustom:{enabled:values.aeReportingPreset===CUSTOM}\n' +
  '    };\n' +
  '  },\n' +
  '  transformer:function(values,source){\n' +
  '    if(!source||!source.name)return values;\n' +
  '    var GROUPS=["abbreviations","contraindications","safetyWarnings","aeReporting"];\n' +
  '    var newValues=Object.assign({},values);\n' +
  '    for(var i=0;i<GROUPS.length;i++){\n' +
  '      var g=GROUPS[i];\n' +
  '      if(source.name===g+"Preset"){\n' +
  '        if(source.value===CUSTOM){\n' +
  '          var p=findPreset(g,lastPreset[g]);\n' +
  '          if(p) newValues[g+"Custom"]=p.text;\n' +
  '        } else if(source.value!==NONE){\n' +
  '          lastPreset[g]=source.value;\n' +
  '        }\n' +
  '      }\n' +
  '    }\n' +
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

export const REGULATORY_FOOTER_CUSTOM_JS =
  'data:text/javascript;charset=utf-8,' + encodeURIComponent(SCRIPT) + '#v=' + VERSION;
