import { LAYOUT, hotspotLayoutKey } from './scene';

export type PanelId =
  | 'about'
  | 'work'
  | 'skills'
  | 'education'
  | 'demos'
  | 'resume'
  | 'contact'
  | 'terminal';

export interface Hotspot {
  id: string;
  label: string; // tooltip text
  panel?: PanelId; // panel to open (if any)
  action?: 'lamp' | 'cat'; // special interactions
  pad: number; // extra clickable padding around the art, in scene px
}

export const HOTSPOTS: Hotspot[] = [
  { id: 'work', label: 'My work — 8 years of building', panel: 'work', pad: 2 },
  { id: 'demos', label: 'Arcade — play my demos', panel: 'demos', pad: 2 },
  { id: 'skills', label: 'The skill shelf', panel: 'skills', pad: 2 },
  {
    id: 'education',
    label: 'Diplomas — where I studied',
    panel: 'education',
    pad: 4,
  },
  { id: 'contact', label: 'Ring me — get in touch', panel: 'contact', pad: 5 },
  { id: 'resume', label: 'Grab my résumé', panel: 'resume', pad: 4 },
  { id: 'about', label: 'About me', panel: 'about', pad: 4 },
  {
    id: 'terminal',
    label: 'Old machine — for the nerds',
    panel: 'terminal',
    pad: 3,
  },
  { id: 'cat', label: 'A very busy colleague', action: 'cat', pad: 4 },
  { id: 'lamp', label: 'Lights', action: 'lamp', pad: 4 },
];

// bounding box of a hotspot in scene coordinates, including padding
export function hotspotBox(h: Hotspot) {
  const box = (LAYOUT as any)[hotspotLayoutKey(h.id)] as {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  return {
    x: box.x - h.pad,
    y: box.y - h.pad,
    w: box.w + h.pad * 2,
    h: box.h + h.pad * 2,
  };
}
