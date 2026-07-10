export interface IconSet {
  default: string;
  unread?: string;
  greyscale?: string;
  greyscaleUnread?: string;
}

export interface AboutPanelOptions {
  applicationName: string;
  website: string;
  iconPath?: string;
}

export interface HelpMenuItem {
  label: string;
  click: () => void;
}

export interface TargetConfig {
  id: string;
  name: string;
  protocol: string;
  defaultUrl: string;
  userAgent?: string;
  windowDefaults?: {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
  };
  iconSet: IconSet;
  preloads: {
    content: string;
  };
  title?: {
    cleanPattern?: RegExp;
    unreadExtractor?: (title: string) => number;
  };
  hooks?: {
    onNotificationClick?: () => void;
    openUrlTransform?: (url: string) => string;
  };
  aboutPanel?: AboutPanelOptions;
  appdataPath?: string;
  showMenuBar?: boolean;
  helpMenuItems?: HelpMenuItem[];
}
