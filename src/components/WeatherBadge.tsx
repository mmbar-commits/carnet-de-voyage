import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplet,
  Snowflake,
  Sun,
} from 'lucide-react';
import { getWeatherConditionLabel, UI_TEXT } from '../i18n/translations';
import type { DayWeather, WeatherKind } from '../store/weather';
import type { Language } from '../types/trip';

interface WeatherIconProps {
  kind: WeatherKind;
  className?: string;
}

export function WeatherIcon({
  kind,
  className = 'h-3.5 w-3.5 stroke-[1.6]',
}: WeatherIconProps) {
  switch (kind) {
    case 'sun':
      return <Sun className={className} aria-hidden="true" />;
    case 'partly_cloudy':
      return <CloudSun className={className} aria-hidden="true" />;
    case 'cloudy':
      return <Cloud className={className} aria-hidden="true" />;
    case 'fog':
      return <CloudFog className={className} aria-hidden="true" />;
    case 'drizzle':
      return <CloudDrizzle className={className} aria-hidden="true" />;
    case 'rain':
      return <CloudRain className={className} aria-hidden="true" />;
    case 'snow':
      return <Snowflake className={className} aria-hidden="true" />;
    case 'storm':
      return <CloudLightning className={className} aria-hidden="true" />;
  }
}

interface WeatherStripProps {
  weather: DayWeather;
  lang: Language;
  surface?: 'ivory' | 'white';
  className?: string;
}

export function WeatherStrip({
  weather,
  lang,
  surface = 'white',
  className = '',
}: WeatherStripProps) {
  const w = UI_TEXT[lang].weather;
  const condition = getWeatherConditionLabel(weather.kind, lang);
  const sourceLabel = weather.isForecast ? w.forecast : w.seasonalShort;
  const sourceTitle = weather.isForecast ? w.forecast : w.seasonal;

  const surfaceClasses =
    surface === 'ivory'
      ? 'border-[#ECE7DE] bg-[#FAF8F4]/90'
      : 'border-[#ECE7DE] bg-white/85';

  return (
    <div
      id={`weather-strip-${weather.dayId}`}
      aria-label={`${weather.minC}° / ${weather.maxC}°, ${condition}, ${w.rain} ${weather.rainPct}%, ${sourceTitle}`}
      className={`flex items-center justify-between gap-1.5 rounded-full border px-2.5 py-1.5 ${surfaceClasses} ${className}`}
    >
      <div className="flex min-w-0 items-center gap-1">
        <WeatherIcon
          kind={weather.kind}
          className="h-3.5 w-3.5 shrink-0 stroke-[1.6] text-[#B39258]"
        />
        <span className="shrink-0 whitespace-nowrap text-[11.5px] font-medium tabular-nums text-[#143B2B]">
          {weather.minC}° / {weather.maxC}°
        </span>
        <span className="shrink-0 text-[#D4CBB8]" aria-hidden="true">
          ·
        </span>
        <span className="truncate text-[11px] font-light text-[#5F7067]">
          {condition}
        </span>
        <span className="shrink-0 text-[#D4CBB8]" aria-hidden="true">
          ·
        </span>
        <span
          title={`${w.rain} : ${weather.rainPct}%`}
          className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[11px] font-light tabular-nums text-[#5F7067]"
        >
          <Droplet
            className="h-3 w-3 shrink-0 stroke-[1.6] text-[#B39258]/90"
            aria-hidden="true"
          />
          <span>{weather.rainPct}%</span>
        </span>
      </div>

      <span
        title={sourceTitle}
        className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[9.5px] tracking-wide ${
          weather.isForecast
            ? 'border border-[#143B2B]/15 bg-[#143B2B]/[0.05] font-normal text-[#143B2B]'
            : 'border border-[#ECE7DE] bg-[#F4F0E8]/80 font-light text-[#5F7067]'
        }`}
      >
        {sourceLabel}
      </span>
    </div>
  );
}
