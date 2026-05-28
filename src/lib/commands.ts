export type PaletteCommand = {
  id: string;
  label: string;
  group?: string;
  shortcut?: string;
  keywords?: string;
  run: () => void | Promise<void>;
};
