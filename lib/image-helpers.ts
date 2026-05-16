export const getProductImageSrc = (image?: string) => {
  if (!image) return "/product_placeholder.jpg";
  return image.startsWith("http") || image.startsWith("/") ? image : `/${image}`;
};
