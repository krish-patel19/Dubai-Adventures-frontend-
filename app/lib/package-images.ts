const FALLBACK_PACKAGE_IMAGE =
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";

function normalizeImage(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function uniqueImages(images: string[]) {
  return Array.from(new Set(images.filter(Boolean)));
}

export function resolvePackageImages(pkg: {
  thumbnailUrl?: unknown;
  images?: unknown;
  image?: unknown;
  heroImage?: unknown;
  coverImage?: unknown;
  featuredImage?: unknown;
  mainImage?: unknown;
}) {
  const explicitHero =
    normalizeImage(pkg.heroImage) ||
    normalizeImage(pkg.coverImage) ||
    normalizeImage(pkg.featuredImage) ||
    normalizeImage(pkg.mainImage) ||
    normalizeImage(pkg.image);

  const thumbnail = normalizeImage(pkg.thumbnailUrl);
  const gallery = Array.isArray(pkg.images)
    ? pkg.images.map(normalizeImage).filter(Boolean)
    : [];
  const hasGalleryImages = gallery.length > 0;

  const heroImage =
    thumbnail ||
    explicitHero ||
    (hasGalleryImages ? gallery.find((image) => image !== thumbnail) || gallery[0] : "") ||
    FALLBACK_PACKAGE_IMAGE;

  const galleryImages = hasGalleryImages
    ? uniqueImages([heroImage, ...gallery.filter((image) => image !== heroImage)])
    : [];

  return {
    heroImage,
    galleryImages,
    hasGalleryImages,
    fallbackImage: FALLBACK_PACKAGE_IMAGE,
  };
}

export function resolveExperienceImage(source: {
  kind?: unknown;
  productType?: unknown;
  image?: unknown;
  images?: unknown;
  bundleImage?: unknown;
  thumbnailUrl?: unknown;
  heroImage?: unknown;
  coverImage?: unknown;
  featuredImage?: unknown;
  mainImage?: unknown;
  totalDays?: unknown;
  totalNights?: unknown;
}) {
  const bundleImage = normalizeImage(source.bundleImage);
  if (bundleImage) {
    return bundleImage;
  }

  const isPackageLike =
    source?.kind === "package" ||
    source?.productType === "package" ||
    typeof source?.totalDays === "number" ||
    typeof source?.totalNights === "number" ||
    normalizeImage(source.thumbnailUrl).length > 0;

  if (isPackageLike) {
    return resolvePackageImages(source).heroImage;
  }

  const explicitImage =
    normalizeImage(source.heroImage) ||
    normalizeImage(source.coverImage) ||
    normalizeImage(source.featuredImage) ||
    normalizeImage(source.mainImage) ||
    normalizeImage(source.image);

  const gallery = Array.isArray(source.images)
    ? source.images.map(normalizeImage).filter(Boolean)
    : [];

  return explicitImage || gallery[0] || normalizeImage(source.thumbnailUrl) || FALLBACK_PACKAGE_IMAGE;
}
