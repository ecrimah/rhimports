/**
 * Single source of truth for product option groups.
 *
 * Used by BOTH the admin ProductForm AND the customer ProductDetailClient
 * (and anywhere else that reads `product.metadata.product_options`).
 *
 * Why this file exists:
 *   `product_options` is stored in `products.metadata` keyed by a short key
 *   (e.g. `"size"`), but `option_names` is stored using the human-readable
 *   *label* (e.g. `"Size"`). Historically these were duplicated in two places
 *   and could drift, silently breaking variant matching on the storefront.
 *   Everything goes through this module now so that can't happen again.
 *
 * To add a new built-in option group, add an entry to DEFAULT_OPTION_GROUPS.
 * No other change is required — the admin form and the customer page pick it
 * up automatically.
 */

export type OptionGroupKey = string;
export type OptionGroupLabel = string;

export interface OptionGroupDef {
  key: OptionGroupKey;
  label: OptionGroupLabel;
  type: 'values' | 'color';
  defaultValues: string[];
  /** Whether selecting a value in this group creates a separate product_variants row. */
  generatesVariants: boolean;
}

export const DEFAULT_OPTION_GROUPS: OptionGroupDef[] = [
  { key: 'color', label: 'Color', type: 'color',  defaultValues: [], generatesVariants: false },
  { key: 'size',  label: 'Size',  type: 'values', defaultValues: [], generatesVariants: true  },
];

/** Shape of one entry inside `products.metadata.product_options`. */
export interface StoredProductOption {
  values: string[];
  generatesVariants?: boolean;
  /** Display label. Optional for backwards-compat with rows saved before we started writing it. */
  label?: string;
}

/** Shape of one entry inside `products.metadata.custom_option_groups`. */
export interface CustomOptionGroup {
  name: string;
  values: string[];
  generatesVariants?: boolean;
}

/** Shape of the slice of `products.metadata` this module owns. */
export interface ProductOptionsMetadata {
  option_names?: string[];
  product_options?: Record<string, StoredProductOption>;
  custom_option_groups?: CustomOptionGroup[];
}

/**
 * Resolve the display label for a default option group key.
 *
 * Falls back to a "Capitalized Words" version of the key so an unknown key
 * still renders something readable (instead of e.g. raw "lace_type").
 */
export function getOptionLabel(key: string): string {
  const match = DEFAULT_OPTION_GROUPS.find(g => g.key === key);
  if (match) return match.label;
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Resolve the display label for a stored option, preferring an explicit
 * label written into metadata, falling back to the canonical map.
 */
export function getStoredOptionLabel(key: string, opt?: StoredProductOption): string {
  return opt?.label?.trim() || getOptionLabel(key);
}

const normKey = (s: string): string => (s || '').trim().toLowerCase();

/**
 * Find the product_variants row that matches the user's selected options.
 *
 * Defensive on purpose: matching is case-insensitive and whitespace-tolerant
 * so any future drift between the label written into `metadata.option_names`
 * and the label rendered in the UI cannot silently break variant selection
 * (which is the bug this module was created to prevent).
 *
 * @param variants - rows from product_variants (each has option1/option2/option3)
 * @param selectedOptions - map of optionLabel → selectedValue, as the UI tracks it
 * @param optionNames - ordered list of variant-generating labels from
 *                     `product.metadata.option_names`
 */
export function findMatchingVariant<
  V extends { option1?: string | null; option2?: string | null; option3?: string | null }
>(
  variants: V[],
  selectedOptions: Record<string, string>,
  optionNames: string[]
): V | null {
  if (!optionNames || optionNames.length === 0) return null;

  const selectedByNorm = new Map<string, string>();
  for (const [k, v] of Object.entries(selectedOptions)) {
    selectedByNorm.set(normKey(k), v);
  }

  const values: (string | undefined)[] = optionNames.map(n => selectedByNorm.get(normKey(n)));
  if (values.some(v => v === undefined || v === '')) return null;

  return (
    variants.find(v =>
      values.every((val, idx) => (v as any)[`option${idx + 1}`] === val)
    ) || null
  );
}

/**
 * True once every variant-generating option in `optionNames` has been
 * chosen by the user. Mirrors the matching rules used by findMatchingVariant.
 */
export function allVariantOptionsSelected(
  selectedOptions: Record<string, string>,
  optionNames: string[]
): boolean {
  if (!optionNames || optionNames.length === 0) return true;
  const selectedByNorm = new Map<string, string>();
  for (const [k, v] of Object.entries(selectedOptions)) {
    selectedByNorm.set(normKey(k), v);
  }
  return optionNames.every(n => {
    const val = selectedByNorm.get(normKey(n));
    return val !== undefined && val !== '';
  });
}
