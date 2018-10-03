import { MAX_VALUE } from '../constants';

export const defaultColors = [
  '#F00',
  '#F10',
  '#F20',
  '#F30',
  '#F40',
  '#F50',
  '#F60',
  '#F70',
  '#F80',
  '#F90',
  '#FA0',
  '#FB0',
  '#FC0',
  '#FD0',
  '#FE0',
  '#FF0',
  '#FF0',
  '#EF0',
  '#CF0',
  '#AF0',
  '#8F0',
  '#6F0',
  '#4F0',
  '#2F0',
  '#0F0',
  '#0F2',
  '#0F4',
  '#0F6',
  '#0F8',
  '#0FA',
  '#0FC',
  '#0FE',
  '#08F',
  '#07F',
  '#06F',
  '#06F',
  '#05F',
  '#04F',
  '#04F',
  '#02F',
  '#00F',
  '#20F',
  '#40F',
  '#60F',
  '#80F',
  '#A0F',
  '#C0F',
  '#E0F',
  '#F0F',
  '#F2F',
  '#F4F',
  '#F6F',
  '#F8F',
  '#FAF',
  '#FCF',
  '#FEF',
  '#FFF',
  '#FEE',
  '#FCC',
  '#FAA',
  '#F88',
  '#F66',
  '#F44',
  '#022'
];

export function hexToRgb(hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

export function parseColor(st: any) {
  // TODO: no idea what this does but it is necessary
  const colorIndex = (st >> 0) & 0x7f;

  const hex = defaultColors[colorIndex % defaultColors.length];
  if (!colorIndex) {
    return { r: 0, g: 0, b: 0 };
  }
  const rgb = hexToRgb(hex);
  return {
    r: Math.floor(MAX_VALUE * (rgb.r / 255)),
    g: Math.floor(MAX_VALUE * (rgb.g / 255)),
    b: Math.floor(MAX_VALUE * (rgb.b / 255))
  };
}
