export function fmtPhoto(p: any) {
  return {
    id: p.id,
    albumId: p.albumId,
    previewUrl: p.previewUrl,
    hdUrl: p.hdUrl,
    thumbnailUrl: p.thumbnailUrl,
    width: p.width,
    height: p.height,
    fileName: p.fileName,
    tags: (p.tags ?? []).map((t: any) => ({ id: t.tag.id, label: t.tag.label })),
    isFavorite: p.isFavorite,
    faceValidationStatus: p.faceValidationStatus,
    category: p.category ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}
