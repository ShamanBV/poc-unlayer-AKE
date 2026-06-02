// Generates per-element Unlayer tool-section JS snippets from a ResolvedElement
// (already passed through brand-cascade + language-pick by resolveElement).
// Shared by all three block factories so the variant-dropdown UX stays
// consistent.
import type { ResolvedElement, ResolvedVariant } from '../policy/compliance';

export interface ElementSectionFragments {
  optionsJs: string;
  propertyStatesEntry: string;
  transformerBranches: string;
  effectiveDefaultVariantId: string;
  variants: ResolvedVariant[];
}

const CUSTOM = '__custom__';
const RESET = '__reset__';

function variantLabel(v: ResolvedVariant): string {
  if (v.id === 'default') return 'Default';
  const note = v.note ?? '';
  const noteShort = note.length > 25 ? note.substring(0, 25) + '…' : note;
  const dep = v.deprecated ? ' [dep]' : '';
  return `${v.id}${noteShort ? ` — ${noteShort}` : ''}${dep}`;
}

export function buildElementSection(
  el: ResolvedElement,
  position: number,
  titlePrefix: string,
): ElementSectionFragments {
  const variants = el.variants;
  const effectiveDefaultId = el.defaultVariantId;

  const dropdownOptions: { value: string; label: string }[] = variants.map((v) => ({
    value: v.id,
    label: variantLabel(v),
  }));
  dropdownOptions.push({ value: CUSTOM, label: 'Custom override' });
  dropdownOptions.push({ value: RESET, label: 'Reset custom to canonical' });

  const title = `${titlePrefix}${el.label || el.slot}`;

  const optionsJs =
    '    ' + JSON.stringify(el.id) + ':{title:' + JSON.stringify(title) + ',position:' + position + ',options:{\n' +
    '      ' + JSON.stringify(el.id + '_variantId') + ':{label:"Source",defaultValue:' + JSON.stringify(effectiveDefaultId) + ',widget:"dropdown",data:{options:' + JSON.stringify(dropdownOptions) + '}},\n' +
    '      ' + JSON.stringify(el.id + '_text') + ':{label:"Custom text",defaultValue:"",widget:"rich_text"}\n' +
    '    }}';

  const propertyStatesEntry =
    '      ' + JSON.stringify(el.id + '_text') + ':{enabled:values[' + JSON.stringify(el.id + '_variantId') + ']==="' + CUSTOM + '"}';

  // Transformer per element: handles __custom__ (pre-fill from last variant)
  // and __reset__ (snap back to default).
  const transformerBranches =
    '    if(source.name===' + JSON.stringify(el.id + '_variantId')+'){\n' +
    '      if(source.value==="' + CUSTOM + '"){\n' +
    '        var lastId=lastVariantIds[' + JSON.stringify(el.id) + ']||' + JSON.stringify(effectiveDefaultId) + ';\n' +
    '        var lv=shamanFindVariant(VARIANTS[' + JSON.stringify(el.id) + '],lastId);\n' +
    '        if(lv)newValues[' + JSON.stringify(el.id + '_text') + ']=shamanResolveTokens(lv.text,lv.placeholders,LINK_CONFIG);\n' +
    '      }else if(source.value==="' + RESET + '"){\n' +
    '        newValues[' + JSON.stringify(el.id + '_variantId') + ']=' + JSON.stringify(effectiveDefaultId) + ';\n' +
    '        var dv=shamanFindVariant(VARIANTS[' + JSON.stringify(el.id) + '],' + JSON.stringify(effectiveDefaultId) + ');\n' +
    '        if(dv)newValues[' + JSON.stringify(el.id + '_text') + ']=shamanResolveTokens(dv.text,dv.placeholders,LINK_CONFIG);\n' +
    '      }else{\n' +
    '        lastVariantIds[' + JSON.stringify(el.id) + ']=source.value;\n' +
    '      }\n' +
    '    }';

  return {
    optionsJs,
    propertyStatesEntry,
    transformerBranches,
    effectiveDefaultVariantId: effectiveDefaultId,
    variants,
  };
}
