import type { ReactNode } from 'react';
import { Baguette, Braid, CinnamonRoll, Cookie, Croissant, HeartCookie, Loaf, Muffin, Pretzel } from './art';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tag?: string;
  art: ReactNode;
}

export const products: Product[] = [
  {
    id: 'sourdough',
    name: 'Country Sourdough',
    description: '48-hour fermented loaf with a crackling crust and an open, tangy crumb.',
    price: 6.5,
    tag: 'Bestseller',
    art: <Loaf size={132} />,
  },
  {
    id: 'croissant',
    name: 'Butter Croissant',
    description: 'Laminated by hand with French butter. Flaky outside, soft inside.',
    price: 3.2,
    art: <Croissant size={132} />,
  },
  {
    id: 'cinnamon',
    name: 'Cinnamon Swirl',
    description: 'Soft brioche dough, Ceylon cinnamon and a light vanilla glaze.',
    price: 3.8,
    tag: 'New',
    art: <CinnamonRoll size={132} />,
  },
  {
    id: 'baguette',
    name: 'Classic Baguette',
    description: 'Baked three times a day, so there is always a warm one waiting.',
    price: 2.9,
    art: <Baguette size={132} />,
  },
  {
    id: 'muffin',
    name: 'Blueberry Muffin',
    description: 'Wild blueberries, brown butter and a crunchy demerara top.',
    price: 3.4,
    art: <Muffin size={132} />,
  },
  {
    id: 'pretzel',
    name: 'Salted Pretzel',
    description: 'Dipped the traditional way and sprinkled with flaky sea salt.',
    price: 2.6,
    art: <Pretzel size={132} />,
  },
];

export interface Special {
  title: string;
  intro: string;
  items: Product[];
}

const everyday: Special = {
  title: 'Weekend favorites',
  intro: 'Only on Saturdays and Sundays, while they last.',
  items: [
    { id: 'rye', name: 'Seeded Rye', description: 'Dark rye with sunflower and pumpkin seeds.', price: 7.2, art: <Loaf size={110} tint="#8a5a2b" /> },
    { id: 'kalacs', name: 'Milk Braid', description: 'Soft, slightly sweet braided milk bread.', price: 5.9, art: <Braid size={110} /> },
    { id: 'cookie', name: 'Butter Cookies', description: 'A box of six, baked every morning.', price: 4.5, art: <Cookie size={110} /> },
  ],
};

const specialsBySeason: Record<string, Special> = {
  christmas: {
    title: 'Christmas at the bakery',
    intro: 'Our holiday classics are back from December 1st. Pre-order for Christmas Eve.',
    items: [
      { id: 'stollen', name: 'Butter Stollen', description: 'Rum-soaked fruit, marzipan heart, snowy sugar.', price: 14.9, art: <Loaf size={110} tint="#e6c79c" /> },
      { id: 'beigli', name: 'Walnut Roll', description: 'Thin dough, rich walnut filling, marbled top.', price: 12.5, art: <Braid size={110} tint="#b7773f" /> },
      { id: 'ginger', name: 'Gingerbread Friends', description: 'Honey gingerbread with royal icing.', price: 5.5, art: <Cookie size={110} tint="#9a6232" /> },
    ],
  },
  'new-year': {
    title: 'New Year party box',
    intro: 'Savory bites for the last night of the year, ready to share.',
    items: [
      { id: 'pogacsa', name: 'Cheese Scones', description: 'A dozen flaky cheese scones.', price: 9.9, art: <Cookie size={110} tint="#d9a441" /> },
      { id: 'pretzel-box', name: 'Mini Pretzels', description: 'Twenty mini pretzels with three dips.', price: 11.5, art: <Pretzel size={110} /> },
      { id: 'kalacs-ny', name: 'Lucky Braid', description: 'A braided loaf for a lucky new year.', price: 7.9, art: <Braid size={110} /> },
    ],
  },
  valentine: {
    title: "Valentine's treats",
    intro: 'Say it with butter. Heart-shaped everything, all week long.',
    items: [
      { id: 'heart', name: 'Raspberry Heart', description: 'Shortbread heart with raspberry glaze.', price: 3.9, art: <HeartCookie size={110} /> },
      { id: 'heart-box', name: 'Box of Hearts', description: 'Six mixed heart cookies in a gift box.', price: 16.0, art: <HeartCookie size={110} tint="#f472b6" /> },
      { id: 'red-velvet', name: 'Red Velvet Roll', description: 'Cinnamon roll dough with cocoa and cream cheese.', price: 4.2, art: <CinnamonRoll size={110} tint="#b91c1c" /> },
    ],
  },
  easter: {
    title: 'Easter table',
    intro: 'Everything for a slow Easter breakfast with the family.',
    items: [
      { id: 'easter-braid', name: 'Easter Braid', description: 'Rich, golden milk braid, big enough for eight.', price: 9.5, art: <Braid size={110} /> },
      { id: 'hot-cross', name: 'Spiced Buns', description: 'Six soft spiced buns with currants.', price: 7.0, art: <Muffin size={110} tint="#7c2d12" /> },
      { id: 'egg-cookie', name: 'Egg Cookies', description: 'Pastel iced shortbread eggs.', price: 5.0, art: <Cookie size={110} tint="#a78bfa" /> },
    ],
  },
  halloween: {
    title: 'Spooky bakes',
    intro: 'Pumpkin, spice and everything not so nice. Only until the 31st.',
    items: [
      { id: 'pumpkin', name: 'Pumpkin Loaf', description: 'Roasted pumpkin, brown sugar, warm spices.', price: 6.9, art: <Loaf size={110} tint="#ea580c" /> },
      { id: 'bat-cookie', name: 'Midnight Cookies', description: 'Dark cocoa cookies with orange icing.', price: 4.8, art: <Cookie size={110} tint="#3b0764" /> },
      { id: 'spider-roll', name: 'Spiced Swirl', description: 'Pumpkin spice swirl with a cobweb glaze.', price: 3.9, art: <CinnamonRoll size={110} tint="#c2410c" /> },
    ],
  },
};

export function specialFor(seasonId: string | undefined): Special & { seasonal: boolean } {
  const s = seasonId ? specialsBySeason[seasonId] : undefined;
  return s ? { ...s, seasonal: true } : { ...everyday, seasonal: false };
}

export const money = (value: number) => `$${value.toFixed(2)}`;
