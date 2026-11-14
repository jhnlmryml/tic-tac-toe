import {
  Anchor,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Music2,
  RefreshCw,
  Settings2,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

const icons = {
  anchor: Anchor,
  arrow: ArrowRight,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  music: Music2,
  refresh: RefreshCw,
  settings: Settings2,
  spark: Sparkles,
  volume: Volume2,
  mute: VolumeX,
};

export type IconName = keyof typeof icons;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const IconComponent = icons[name];
  return <IconComponent width={size} height={size} strokeWidth={1.7} aria-hidden="true" />;
}
