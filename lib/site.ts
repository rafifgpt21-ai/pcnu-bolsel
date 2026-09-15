export const SITE_URL = "https://pcnubolsel.id";
export const SITE_NAME = "PCNU Bolsel";
export const ORGANIZATION_NAME =
  "Pengurus Cabang Nahdlatul Ulama Kabupaten Bolaang Mongondow Selatan";
export const SITE_DESCRIPTION =
  "Portal resmi PCNU Bolaang Mongondow Selatan yang menyajikan berita NU Bolsel, kegiatan organisasi, pengumuman, dan wawasan Islam.";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return new URL(path, `${SITE_URL}/`).toString();
}
