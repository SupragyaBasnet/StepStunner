declare module 'react-color' {
  export interface ColorResult {
    hex: string;
    rgb: { r: number; g: number; b: number; a?: number };
    hsl: { h: number; s: number; l: number; a?: number };
  }

  export interface ChromePickerProps {
    color?: string | ColorResult;
    onChange?: (color: ColorResult) => void;
    disableAlpha?: boolean;
  }

  export class ChromePicker extends React.Component<ChromePickerProps> {}
} 