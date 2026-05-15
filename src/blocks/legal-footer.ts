// Custom Unlayer tool: "Legal footer"
// Sits at the very bottom of an email below the Compliance Notes block.
// Stacks: Logo · Address & registration · Unsubscribe · Privacy notice ·
// Confidentiality notice · Approval code & date.
//
// Same preset/custom/none pattern as Regulatory and Compliance blocks for the
// re-usable text fields. Logo "content" is a URL (custom override is a plain
// text input). Approval code is a free-text per-email field with no presets.

export interface LegalFooterPreset {
  id: string;
  label: string;
  text: string;
}

export const LEGAL_FOOTER_PRESETS: Record<
  'logo' | 'address' | 'unsubscribe' | 'privacy' | 'confidentiality',
  LegalFooterPreset[]
> = {
  logo: [
    {
      id: 'novartis',
      label: 'Novartis',
      // Public Wikimedia file used as a stand-in until the real CDN URL is wired
      text: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Novartis-Logo.svg/320px-Novartis-Logo.svg.png',
    },
  ],
  address: [
    {
      id: 'novartis-uk',
      label: 'Novartis UK',
      text:
        'Novartis Pharmaceuticals UK Limited<br>2nd Floor, The WestWorks Building, 195 Wood Lane, London W12 7FQ<br>Registered in England No. 119006',
    },
    {
      id: 'novartis-us',
      label: 'Novartis US',
      text:
        'Novartis Pharmaceuticals Corporation<br>One Health Plaza, East Hanover, NJ 07936-1080',
    },
  ],
  unsubscribe: [
    {
      id: 'standard',
      label: 'Standard',
      text:
        'You can <a href="{{unsubscribe_link}}">unsubscribe</a> from these emails at any time.',
    },
  ],
  privacy: [
    {
      id: 'novartis',
      label: 'Novartis',
      text:
        'For information on how Novartis processes your personal data, see our <a href="https://www.novartis.com/privacy-policy">Privacy Policy</a>.',
    },
  ],
  confidentiality: [
    {
      id: 'standard',
      label: 'Standard',
      text:
        'This email is confidential and intended only for the addressee. If you received this in error, please delete it and notify the sender.',
    },
  ],
};

const VERSION = Date.now();

const LOCK_SVG =
  '<svg aria-hidden="true" focusable="false" data-prefix="fal" data-icon="lock" class="svg-inline--fa fa-lock fa-3x" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M128 128l0 64 192 0 0-64c0-53-43-96-96-96s-96 43-96 96zM96 192l0-64C96 57.3 153.3 0 224 0s128 57.3 128 128l0 64 16 0c44.2 0 80 35.8 80 80l0 160c0 44.2-35.8 80-80 80L80 512c-44.2 0-80-35.8-80-80L0 272c0-44.2 35.8-80 80-80l16 0zM32 272l0 160c0 26.5 21.5 48 48 48l288 0c26.5 0 48-21.5 48-48l0-160c0-26.5-21.5-48-48-48L80 224c-26.5 0-48 21.5-48 48z"/></svg>';

const SCRIPT =
  '(function(){\n' +
  'console.log("[legal_footer] customJS loaded v=' + VERSION + '");\n' +
  'var PRESETS = ' + JSON.stringify(LEGAL_FOOTER_PRESETS) + ';\n' +
  'var CUSTOM = "__custom__";\n' +
  'var NONE = "__none__";\n' +
  'var NONE_LABELS = {logo:"No logo",address:"No address",unsubscribe:"No unsubscribe",privacy:"No privacy notice",confidentiality:"No confidentiality notice"};\n' +
  'var lastPreset = {logo:"novartis",address:"novartis-uk",unsubscribe:"standard",privacy:"novartis",confidentiality:"standard"};\n' +
  'function presetOptions(group){var opts=PRESETS[group].map(function(p){return {value:p.id,label:p.label};});opts.push({value:CUSTOM,label:"Custom override"});opts.push({value:NONE,label:NONE_LABELS[group]});return opts;}\n' +
  'function findPreset(group,id){for(var i=0;i<PRESETS[group].length;i++){if(PRESETS[group][i].id===id)return PRESETS[group][i];}return null;}\n' +
  'function pickText(group,presetId,customHtml){if(presetId===NONE)return null;if(presetId===CUSTOM)return customHtml||"";var p=findPreset(group,presetId);return p?p.text:"";}\n' +
  'function renderHtml(values){\n' +
  '  var bg=values.backgroundColor||"";\n' +
  '  var color=values.color||"";\n' +
  '  var textAlign=values.textAlign||"center";\n' +
  '  var padding=values.padding||"24px";\n' +
  '  var fontSize=values.fontSize||"11px";\n' +
  '  var logoWidth=values.logoWidth||"180";\n' +
  '  var html=\'<div style="\'+(bg?\'background-color:\'+bg+\';\':\'\')+\'padding:\'+padding+\';font-family:arial,helvetica,sans-serif;font-size:\'+fontSize+\';\'+(color?\'color:\'+color+\';\':\'\')+\'text-align:\'+textAlign+\';line-height:150%;">\';\n' +
  '  var logo=pickText("logo",values.logoPreset,values.logoCustom);\n' +
  '  if(logo){html+=\'<div style="margin:0 0 16px 0;"><img src="\'+logo+\'" alt="Logo" width="\'+logoWidth+\'" style="display:inline-block;max-width:100%;height:auto;border:0;" /></div>\';}\n' +
  '  var addr=pickText("address",values.addressPreset,values.addressCustom);\n' +
  '  if(addr!==null){html+=\'<div style="margin:0 0 12px 0;">\'+addr+\'</div>\';}\n' +
  '  var unsub=pickText("unsubscribe",values.unsubscribePreset,values.unsubscribeCustom);\n' +
  '  if(unsub!==null){html+=\'<div style="margin:0 0 6px 0;">\'+unsub+\'</div>\';}\n' +
  '  var priv=pickText("privacy",values.privacyPreset,values.privacyCustom);\n' +
  '  if(priv!==null){html+=\'<div style="margin:0 0 12px 0;">\'+priv+\'</div>\';}\n' +
  '  var conf=pickText("confidentiality",values.confidentialityPreset,values.confidentialityCustom);\n' +
  '  if(conf!==null){html+=\'<div style="margin:12px 0 0 0;font-size:10px;color:#879091;">\'+conf+\'</div>\';}\n' +
  '  if(values.approvalCode&&String(values.approvalCode).trim()){html+=\'<div style="margin:8px 0 0 0;font-size:9px;color:#9FA3A4;">\'+values.approvalCode+\'</div>\';}\n' +
  '  html+=\'</div>\';\n' +
  '  return html;\n' +
  '}\n' +
  'unlayer.registerTool({\n' +
  '  name:"legal_footer",\n' +
  '  label:"Legal footer",\n' +
  '  icon:' + JSON.stringify(LOCK_SVG) + ',\n' +
  '  position:3,\n' +
  '  supportedDisplayModes:["email","web"],\n' +
  '  css:".u_content_custom_legal_footer{padding:0 !important;}",\n' +
  '  options:{\n' +
  '    logo:{title:"Logo",position:1,options:{\n' +
  '      logoPreset:{label:"Source",defaultValue:"novartis",widget:"dropdown",data:{options:presetOptions("logo")}},\n' +
  '      logoCustom:{label:"Custom URL",defaultValue:"",widget:"text"},\n' +
  '      logoWidth:{label:"Logo width (px)",defaultValue:"180",widget:"text"}\n' +
  '    }},\n' +
  '    address:{title:"Address & Registration",position:2,options:{\n' +
  '      addressPreset:{label:"Content",defaultValue:"novartis-uk",widget:"dropdown",data:{options:presetOptions("address")}},\n' +
  '      addressCustom:{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
  '    }},\n' +
  '    unsubscribe:{title:"Unsubscribe",position:3,options:{\n' +
  '      unsubscribePreset:{label:"Content",defaultValue:"standard",widget:"dropdown",data:{options:presetOptions("unsubscribe")}},\n' +
  '      unsubscribeCustom:{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
  '    }},\n' +
  '    privacy:{title:"Privacy Notice",position:4,options:{\n' +
  '      privacyPreset:{label:"Content",defaultValue:"novartis",widget:"dropdown",data:{options:presetOptions("privacy")}},\n' +
  '      privacyCustom:{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
  '    }},\n' +
  '    confidentiality:{title:"Confidentiality",position:5,options:{\n' +
  '      confidentialityPreset:{label:"Content",defaultValue:"standard",widget:"dropdown",data:{options:presetOptions("confidentiality")}},\n' +
  '      confidentialityCustom:{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
  '    }},\n' +
  '    approval:{title:"Approval Code & Date",position:6,options:{\n' +
  '      approvalCode:{label:"Approval code",defaultValue:"UK | 2026-05 | XX-12345",widget:"text"}\n' +
  '    }},\n' +
  '    style:{title:"Style",position:7,options:{\n' +
  '      backgroundColor:{label:"Background colour",widget:"color_picker",data:{mode:"CONTRAST"}},\n' +
  '      fontSize:{label:"Font size",defaultValue:"11px",widget:"font_size"},\n' +
  '      color:{label:"Text colour",widget:"color_picker",data:{mode:"CONTRAST"}},\n' +
  '      textAlign:{label:"Alignment",defaultValue:"center",widget:"alignment"},\n' +
  '      padding:{label:"Padding",defaultValue:"24px",widget:"padding"}\n' +
  '    }}\n' +
  '  },\n' +
  '  values:{},\n' +
  '  propertyStates:function(values){\n' +
  '    return {\n' +
  '      logoCustom:{enabled:values.logoPreset===CUSTOM},\n' +
  '      addressCustom:{enabled:values.addressPreset===CUSTOM},\n' +
  '      unsubscribeCustom:{enabled:values.unsubscribePreset===CUSTOM},\n' +
  '      privacyCustom:{enabled:values.privacyPreset===CUSTOM},\n' +
  '      confidentialityCustom:{enabled:values.confidentialityPreset===CUSTOM}\n' +
  '    };\n' +
  '  },\n' +
  '  transformer:function(values,source){\n' +
  '    if(!source||!source.name)return values;\n' +
  '    var GROUPS=["logo","address","unsubscribe","privacy","confidentiality"];\n' +
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

export const LEGAL_FOOTER_CUSTOM_JS =
  'data:text/javascript;charset=utf-8,' + encodeURIComponent(SCRIPT) + '#v=' + VERSION;
