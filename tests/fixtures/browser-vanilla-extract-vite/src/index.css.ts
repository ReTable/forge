import { style } from '@vanilla-extract/css';

export const dev = style({
  selectors: {
    '&::before': {
      content: `${import.meta.env.DEV}`,
    },
  },
});

export const prod = style({
  selectors: {
    '&::before': {
      content: `${import.meta.env.PROD}`,
    },
  },
});

export const mode = style({
  selectors: {
    '&::before': {
      content: `${import.meta.env.MODE}`,
    },
  },
});
