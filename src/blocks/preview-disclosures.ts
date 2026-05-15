// Custom Unlayer tool: "Preview disclosures"
// Sits at the top of an email and renders four toggleable sections:
//   1. Audience restriction (e.g. "Promotional email intended for UK HCPs only.")
//   2. PI link (bold sentence with inline "here" link)
//   3. Adverse event reporting note
//   4. Indication text (separated by extra top margin)
//
// Each section has a preset dropdown (POC values; will come from Knowledge
// Base later) and a rich-text custom override field. Style props (font size,
// colour, alignment, padding) live on the tool now and will move into the
// editor policy later.

export interface Preset {
  id: string;
  label: string;
  // text is HTML — presets may contain <a>, <sup>, etc.
  text: string;
}

export const PREVIEW_DISCLOSURES_PRESETS: Record<'audience' | 'pi' | 'adverse' | 'indication', Preset[]> = {
  audience: [
    {
      id: 'uk-hcp-novartis',
      label: 'UK HCP — Novartis',
      text:
        'This is a promotional email created and funded by Novartis, intended for UK Healthcare Professionals only.',
    },
    {
      id: 'us-hcp',
      label: 'US HCP',
      text: 'For US Healthcare Professionals only.',
    },
    {
      id: 'eu-hcp',
      label: 'EU HCP',
      text: 'For European Healthcare Professionals only.',
    },
  ],
  pi: [
    {
      id: 'scemblix',
      label: 'SCEMBLIX',
      text:
        'Prescribing information for SCEMBLIX<sup>&reg;</sup>&nbsp;&#9660; (asciminib) can be found <a href="https://www.example.com/scemblix-pi">here</a> (external link).',
    },
    {
      id: 'fruzaqla',
      label: 'Fruzaqla',
      text:
        'Prescribing information for Fruzaqla<sup>&reg;</sup> (fruquintinib) can be found <a href="https://www.example.com/fruzaqla-pi">here</a> (external link).',
    },
  ],
  adverse: [
    {
      id: 'inline-note',
      label: 'Inline note (footer reference)',
      text: 'Adverse event reporting information can be found at the bottom of the email.',
    },
    {
      id: 'fda-medwatch',
      label: 'US FDA MedWatch',
      text:
        'You are encouraged to report negative side effects of prescription drugs to the FDA. Visit www.fda.gov/medwatch or call 1-800-FDA-1088.',
    },
  ],
  indication: [
    {
      id: 'scemblix-cml',
      label: 'SCEMBLIX Ph+ CML',
      text:
        'SCEMBLIX<sup>&reg;</sup>&nbsp;&#9660; (asciminib) is indicated for the treatment of adult patients with Philadelphia chromosome-positive chronic myeloid leukaemia (Ph + CML) in chronic phase (CP), previously treated with two or more tyrosine kinase inhibitors, and without a known T315I mutation.',
    },
    {
      id: 'fruzaqla-mcrc',
      label: 'Fruzaqla mCRC',
      text:
        'Fruzaqla<sup>&reg;</sup> (fruquintinib) is indicated for the treatment of adult patients with metastatic colorectal cancer (mCRC) who have been previously treated with fluoropyrimidine-, oxaliplatin-, and irinotecan-based chemotherapy.',
    },
  ],
};

// Build the script that runs inside the Unlayer editor iframe. We avoid
// template literals so JSON.stringify output (which contains ${...} sequences
// in URLs etc.) doesn't get re-interpolated by the outer TypeScript template.
const VERSION = Date.now();

const MEGAPHONE_SVG =
  '<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="megaphone" class="svg-inline--fa fa-megaphone fa-3x" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M560 32c-8.8 0-16 7.2-16 16l0 11.5L32 187.5 32 176c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 19.5L0 208l0 96 0 12.5L0 336c0 8.8 7.2 16 16 16s16-7.2 16-16l0-11.5 131.7 32.9c-2.4 8.4-3.7 17.4-3.7 26.6c0 53 43 96 96 96c46.2 0 84.7-32.6 93.9-76L544 452.5l0 11.5c0 8.8 7.2 16 16 16s16-7.2 16-16l0-24 0-368 0-24c0-8.8-7.2-16-16-16zM544 419.5L32 291.5l0-71 512-128 0 327zM192 384c0-6.5 1-12.9 2.8-18.8l124 31C313.1 425.7 287.2 448 256 448c-35.3 0-64-28.7-64-64z"/></svg>';

const SCRIPT =
  '(function(){\n' +
  'console.log("[preview_disclosures] customJS loaded v=' + VERSION + '");\n' +
  'var PRESETS = ' + JSON.stringify(PREVIEW_DISCLOSURES_PRESETS) + ';\n' +
  'var CUSTOM = "__custom__";\n' +
  'var NONE = "__none__";\n' +
  'var NONE_LABELS = {audience:"No audience restriction",pi:"No PI link",adverse:"No adverse events",indication:"No indication"};\n' +
  'var lastPreset = {audience:"uk-hcp-novartis",pi:"scemblix",adverse:"inline-note",indication:"scemblix-cml"};\n' +
  'function presetOptions(group){var opts=PRESETS[group].map(function(p){return {value:p.id,label:p.label};});opts.push({value:CUSTOM,label:"Custom override"});opts.push({value:NONE,label:NONE_LABELS[group]});return opts;}\n' +
  'function findPreset(group,id){for(var i=0;i<PRESETS[group].length;i++){if(PRESETS[group][i].id===id)return PRESETS[group][i];}return null;}\n' +
  'function pickText(group,presetId,customHtml){if(presetId===NONE)return null;if(presetId===CUSTOM)return customHtml||"";var p=findPreset(group,presetId);return p?p.text:"";}\n' +
  'function renderHtml(values){\n' +
  '  var fontSize=values.fontSize||"13px";\n' +
  '  var color=values.color||"";\n' +
  '  var textAlign=values.textAlign||"center";\n' +
  '  var bg=values.backgroundColor||"";\n' +
  '  var padding=values.padding||"15px 25px";\n' +
  '  var html=\'<div style="\'+(bg?\'background-color:\'+bg+\';\':\'\')+\'padding:\'+padding+\';font-size:\'+fontSize+\';\'+(color?\'color:\'+color+\';\':\'\')+\'text-align:\'+textAlign+\';line-height:140%;font-family:arial,helvetica,sans-serif;">\';\n' +
  '  var aud=pickText("audience",values.audiencePreset,values.audienceCustom);\n' +
  '  if(aud!==null) html+=\'<div style="margin:0 0 6px 0;">\'+aud+\'</div>\';\n' +
  '  var pi=pickText("pi",values.piPreset,values.piCustom);\n' +
  '  if(pi!==null) html+=\'<div style="margin:0 0 6px 0;font-weight:bold;">\'+pi+\'</div>\';\n' +
  '  var adv=pickText("adverse",values.adversePreset,values.adverseCustom);\n' +
  '  if(adv!==null) html+=\'<div style="margin:0 0 6px 0;">\'+adv+\'</div>\';\n' +
  '  var ind=pickText("indication",values.indicationPreset,values.indicationCustom);\n' +
  '  if(ind!==null) html+=\'<div style="margin:18px 0 0 0;">\'+ind+\'</div>\';\n' +
  '  html+=\'</div>\';\n' +
  '  return html;\n' +
  '}\n' +
  'unlayer.registerTool({\n' +
  '  name:"preview_disclosures",\n' +
  '  label:"Preview disclosures",\n' +
  '  icon:' + JSON.stringify(MEGAPHONE_SVG) + ',\n' +
  '  position:1,\n' +
  '  supportedDisplayModes:["email","web"],\n' +
  '  css:".u_content_custom_preview_disclosures{padding:0 !important;}",\n' +
  '  options:{\n' +
  '    audience:{title:"Audience Restriction",position:1,options:{\n' +
  '      audiencePreset:{label:"Content",defaultValue:"uk-hcp-novartis",widget:"dropdown",data:{options:presetOptions("audience")}},\n' +
  '      audienceCustom:{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
  '    }},\n' +
  '    pi:{title:"PI Link",position:2,options:{\n' +
  '      piPreset:{label:"Content",defaultValue:"scemblix",widget:"dropdown",data:{options:presetOptions("pi")}},\n' +
  '      piCustom:{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
  '    }},\n' +
  '    adverse:{title:"Adverse Events",position:3,options:{\n' +
  '      adversePreset:{label:"Content",defaultValue:"inline-note",widget:"dropdown",data:{options:presetOptions("adverse")}},\n' +
  '      adverseCustom:{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
  '    }},\n' +
  '    indication:{title:"Indication",position:4,options:{\n' +
  '      indicationPreset:{label:"Content",defaultValue:"scemblix-cml",widget:"dropdown",data:{options:presetOptions("indication")}},\n' +
  '      indicationCustom:{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
  '    }},\n' +
  '    style:{title:"Style",position:5,options:{\n' +
  '      backgroundColor:{label:"Background colour",widget:"color_picker",data:{mode:"CONTRAST"}},\n' +
  '      fontSize:{label:"Font size",defaultValue:"13px",widget:"font_size"},\n' +
  '      color:{label:"Text colour",widget:"color_picker",data:{mode:"CONTRAST"}},\n' +
  '      textAlign:{label:"Alignment",defaultValue:"center",widget:"alignment"},\n' +
  '      padding:{label:"Padding",defaultValue:"15px 25px",widget:"padding"}\n' +
  '    }}\n' +
  '  },\n' +
  '  values:{},\n' +
  '  propertyStates:function(values){\n' +
  '    return {\n' +
  '      audienceCustom:{enabled:values.audiencePreset===CUSTOM},\n' +
  '      piCustom:{enabled:values.piPreset===CUSTOM},\n' +
  '      adverseCustom:{enabled:values.adversePreset===CUSTOM},\n' +
  '      indicationCustom:{enabled:values.indicationPreset===CUSTOM}\n' +
  '    };\n' +
  '  },\n' +
  '  transformer:function(values,source){\n' +
  '    if(!source||!source.name)return values;\n' +
  '    var GROUPS=["audience","pi","adverse","indication"];\n' +
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

export const PREVIEW_DISCLOSURES_CUSTOM_JS =
  'data:text/javascript;charset=utf-8,' + encodeURIComponent(SCRIPT) + '#v=' + VERSION;
