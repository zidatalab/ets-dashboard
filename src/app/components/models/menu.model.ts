export interface MenuItem {
  title?: string;
  icon?: string;
  link?: string;

  hideFor?: string;

  expanded?: boolean;
}

export type Menu = MenuItem[];
