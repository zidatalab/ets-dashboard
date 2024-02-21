export interface MenuItem {
  title?: string;
  icon?: string;
  link?: string;
  isShow?: boolean

  expanded?: boolean;
}

export type Menu = MenuItem[];
