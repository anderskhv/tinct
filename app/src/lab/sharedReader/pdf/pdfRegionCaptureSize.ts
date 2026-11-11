/**
 * The canvases capturePdfRegion draws a figure, table or formula on: the whole page (`raw`) at a scale that puts the
 * region's long side at PDF_REGION_IMAGE_SIDE, and the region cut from it (`crop`), which is the picture sent.
 *
 * The Worker refuses a passage picture over 1568 px on its long side (chatImages.ts PASSAGE_IMAGE_SIDE:
 * `image_rejected`, a 400, which the reader showed as "Tinct could not answer this time (error 400)"). The page canvas
 * is rounded up to whole pixels, so the region cut from it came out a pixel over for about a third of all regions
 * (any whose long side the scale sets and whose share of the page rounds up): the crop is held to the cap.
 */
export const PDF_REGION_IMAGE_SIDE = 1568

export function pdfRegionCaptureSize(region: { w: number; h: number }, page: { width: number; height: number }) {
  const scale = Math.min(PDF_REGION_IMAGE_SIDE / Math.max(region.w * page.width, region.h * page.height), Math.sqrt(12e6 / (page.width * page.height)))
  const raw = { width: Math.ceil(page.width * scale), height: Math.ceil(page.height * scale) }
  const side = (share: number, whole: number) => Math.min(PDF_REGION_IMAGE_SIDE, Math.max(1, Math.round(share * whole)))
  return { scale, raw, crop: { width: side(region.w, raw.width), height: side(region.h, raw.height) } }
}
