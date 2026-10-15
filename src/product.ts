// Add approved assets under public/assets; URLs are relative to the deployment base.
export type Edition = 'night' | 'day';
export const productAssets: Record<Edition, { model: string | null; image: string | null }> = {
  night: { model: 'assets/soulgrain_onward_template_white_preview.glb', image: null },
  day: { model: 'assets/soulgrain_onward_template_white_preview.glb', image: null },
};
export function assetUrl(path: string) { return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`; }
