// The Ether Dream firmware uses 16-bit integers for all variables, ranging from 0 to 65535.
// We need this number as the correct scale values for many parameters.
// Source: https://github.com/j4cbo/j4cDAC/blob/e592ebcb7c9b6fb521be2005f4b85de54bc04f0f/common/protocol.h
export const MAX_VALUE = 65535;

// TODO: find out what this does exactly
export const RESOLUTION = 150;

export const BLANKING_AMOUNT = 24;

// This value determines how many times a Wait-point should be applied for the sharpest possible angles (360 degree angles).
export const MAX_WAIT_AMOUNT = 10;
