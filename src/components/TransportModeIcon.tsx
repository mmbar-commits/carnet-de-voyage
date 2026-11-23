import {
  Bus,
  Car,
  CarTaxiFront,
  Footprints,
  Navigation,
  Plane,
  Ship,
  TrainFront,
  TramFront,
  type LucideIcon,
} from 'lucide-react';
import type { TransportMode } from '../types/trip';

export const TRANSPORT_MODE_ICONS: Record<TransportMode, LucideIcon> = {
  avion: Plane,
  train: TrainFront,
  metro: TramFront,
  voiture: Car,
  taxi: CarTaxiFront,
  bus: Bus,
  ferry: Ship,
  marche: Footprints,
  autre: Navigation,
};

interface TransportModeIconProps {
  mode: TransportMode;
  className?: string;
}

export function TransportModeIcon({ mode, className }: TransportModeIconProps) {
  const Icon = TRANSPORT_MODE_ICONS[mode] ?? Navigation;
  return <Icon className={className} />;
}
