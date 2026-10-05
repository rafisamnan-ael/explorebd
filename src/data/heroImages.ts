/**
 * Hero slideshow images. All are openly licensed (CC BY / CC BY-SA) and must
 * keep their attribution — see the Credits page. Fetched from Wikimedia Commons
 * by `scripts/fetch-hero-images.ts`.
 */
export interface HeroImage {
  slug: string;
  src: string;
  caption: string;
  place: string;
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
}

export const heroImages: HeroImage[] = [
  {
    slug: 'ratargul',
    src: '/images/hero/ratargul.jpg',
    caption: 'Glide through a flooded freshwater swamp forest',
    place: 'Ratargul, Sylhet',
    author: 'Sumon Mallick',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ratargul_Swamp_Forest,_Sylhet..jpg',
  },
  {
    slug: 'sreemangal-tea',
    src: '/images/hero/sreemangal-tea.jpg',
    caption: 'Rolling tea gardens of the northeast',
    place: 'Sreemangal, Moulvibazar',
    author: 'Kritzolina',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tea_gardens_in_Sreemangal_03.jpg',
  },
  {
    slug: 'coxs-bazar',
    src: '/images/hero/coxs-bazar.jpg',
    caption: 'Sunset on the world’s longest natural beach',
    place: "Cox's Bazar",
    author: 'Tanweer Morshed',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cox%27s_Bazar_sea_beach_01.jpg",
  },
  {
    slug: 'sajek',
    src: '/images/hero/sajek.jpg',
    caption: 'Cloud-kissed hills in the Chittagong Hill Tracts',
    place: 'Sajek, Rangamati',
    author: 'Anica Tabassum',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sajek_Valley,_Rangamati,Bangladesh.jpg',
  },
  {
    slug: 'haor',
    src: '/images/hero/haor.jpg',
    caption: 'Endless wetlands that feed a nation',
    place: 'Tanguar Haor, Sunamganj',
    author: 'Munirul Hasan',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Tanguar_Haor_(%E0%A6%9F%E0%A6%BE%E0%A6%99%E0%A7%8D%E0%A6%97%E0%A7%81%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%B0_%E0%A6%B9%E0%A6%BE%E0%A6%93%E0%A6%B0).JPG',
  },
  {
    slug: 'kaptai-lake',
    src: '/images/hero/kaptai-lake.jpg',
    caption: 'A hanging bridge over Bangladesh’s largest lake',
    place: 'Kaptai Lake, Rangamati',
    author: 'Shakhawat Hossen Shafat',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hanging_Bridge,_Kaptai_Lake.jpg',
  },
  {
    slug: 'lalbagh-fort',
    src: '/images/hero/lalbagh-fort.jpg',
    caption: 'Mughal-era heritage in the heart of old Dhaka',
    place: 'Lalbagh Fort, Dhaka',
    author: 'Shmunmun',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lalbagh_Kella_(Lalbagh_Fort)_Dhaka_Bangladesh_2011_12.JPG',
  },
  {
    slug: 'padma-river',
    src: '/images/hero/padma-river.jpg',
    caption: 'Life along the mighty Padma',
    place: 'Padma River',
    author: 'Shahnoor Habib Munmun',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Padma_River_Bangladesh_(8).JPG',
  },
  {
    slug: 'jaflong',
    src: '/images/hero/jaflong.jpg',
    caption: 'Rivers, stones and tea country on the Sylhet border',
    place: 'Jaflong, Sylhet',
    author: 'Shahnoor Habib Munmun',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jaflong_Sylhet_Bangladesh_(9).JPG',
  },
];
