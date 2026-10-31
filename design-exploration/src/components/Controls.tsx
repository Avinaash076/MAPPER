import {
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react';
import { designs, semanticColors, type DesignDirection, type ThemeMode } from '../designs';
import { photoCredit, type SamplePlace } from '../data';
import { Icon, type IconName } from './Icon';

export function showPreviewMessage(message: string) {
  window.dispatchEvent(new CustomEvent('preview-message', { detail: message }));
}
export function ThemeSurface({
  direction,
  mode,
  children,
  className = '',
}: {
  direction: DesignDirection;
  mode: ThemeMode;
  children: ReactNode;
  className?: string;
}) {
  const design = designs[direction];
  const variables: Record<string, string> = {};
  for (const [key, value] of Object.entries({ ...design.colors[mode], ...semanticColors[mode] }))
    variables[`--${key}`] = value;
  variables['--heading'] = `'${design.headingFont}', 'Noto Sans Kannada', serif`;
  variables['--radius'] = `${design.radius}px`;
  variables['--sheet-radius'] = `${design.sheetRadius}px`;
  return (
    <section
      className={`theme direction-${direction} ${className}`}
      data-mode={mode}
      style={variables as CSSProperties}
    >
      {children}
    </section>
  );
}
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand">
      <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
        <path
          d="M9 47 22 16 32 36 42 16 55 47"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="55" cy="47" r="3" fill="currentColor" />
      </svg>
      {!compact && (
        <span>
          MAPPER<span className="brand-sub">NORTHERN TRAILS</span>
        </span>
      )}
    </span>
  );
}
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet';
  icon?: IconName;
}
export function Button({
  variant = 'primary',
  icon,
  children,
  onClick,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`button ${variant} ${className}`}
      onClick={
        onClick ??
        (() => showPreviewMessage('Component example. Full screen flows arrive in Stage 4.'))
      }
    >
      {children}
      {icon && <Icon name={icon} />}
    </button>
  );
}
export function Field({
  label,
  placeholder,
  help,
  error,
}: {
  label: string;
  placeholder: string;
  help?: string;
  error?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <Icon name="search" />
        <input
          id={id}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={help || error ? `${id}-help` : undefined}
        />
      </div>
      {(help || error) && (
        <span id={`${id}-help`} className={error ? 'error-text' : 'muted'}>
          {error || help}
        </span>
      )}
    </div>
  );
}
export function Chip({
  label,
  icon,
  initialSelected = false,
}: {
  label: string;
  icon: IconName;
  initialSelected?: boolean;
}) {
  const [selected, setSelected] = useState(initialSelected);
  return (
    <button
      className={`chip ${selected ? 'selected' : ''}`}
      aria-pressed={selected}
      onClick={() => setSelected(!selected)}
    >
      <Icon name={selected ? 'check' : icon} size={20} />
      {label}
    </button>
  );
}
export function Categories() {
  return (
    <div className="chips" aria-label="Interest component examples">
      <Chip label="Nature" icon="tree" initialSelected />
      <Chip label="Waterfalls" icon="waves" />
      <Chip label="Heritage" icon="heritage" />
      <Chip label="Spiritual" icon="spiritual" />
      <Chip label="Activities" icon="activity" />
    </div>
  );
}
export function Photo({ place, className = '' }: { place: SamplePlace; className?: string }) {
  const credit = photoCredit(place);
  return (
    <figure className={`photo ${className}`}>
      <img
        src={`/assets/photos/${place.id}.jpg`}
        alt={`${place.name}, ${place.area}`}
        loading="lazy"
      />
      <figcaption>
        <a href={credit.sourceUrl} target="_blank" rel="noreferrer">
          {credit.author} · {credit.license}
        </a>
      </figcaption>
    </figure>
  );
}
export function PlaceCard({ place, compact = false }: { place: SamplePlace; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  return (
    <article className={`place-card ${compact ? 'compact-card' : ''}`}>
      <Photo place={place} />
      <div className="place-copy">
        <div className="eyebrow">
          {place.category} / {place.area}
        </div>
        <div className="card-title-row">
          <h3>{place.name}</h3>
          <button
            className="icon-button"
            aria-label={saved ? `Unsave ${place.name}` : `Save ${place.name}`}
            aria-pressed={saved}
            onClick={() => setSaved(!saved)}
          >
            <Icon name="bookmark" filled={saved} />
          </button>
        </div>
        <p>{place.description}</p>
        <div className="card-meta">
          <span>
            <Icon name="pin" size={20} />
            {place.area}
          </span>
          <span>{saved ? 'Saved in this preview' : 'Sample destination card'}</span>
        </div>
      </div>
    </article>
  );
}
export function StatusMessage({
  kind,
  title,
  children,
}: {
  kind: 'success' | 'warning' | 'error' | 'information';
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={`status ${kind}`}>
      <Icon
        name={
          kind === 'success'
            ? 'check'
            : kind === 'warning'
              ? 'clock'
              : kind === 'error'
                ? 'warning'
                : 'pin'
        }
      />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
export function NavigationPreview({ rail = false }: { rail?: boolean }) {
  const [active, setActive] = useState('Discover');
  const items: [string, IconName][] = [
    ['Discover', 'compass'],
    ['My plan', 'path'],
    ['Saved', 'bookmark'],
  ];
  return (
    <nav className={`app-nav ${rail ? 'rail' : ''}`} aria-label="Navigation component example">
      {items.map(([label, icon]) => (
        <button
          key={label}
          className={active === label ? 'active' : ''}
          aria-current={active === label ? 'page' : undefined}
          onClick={() => {
            setActive(label);
            showPreviewMessage(
              `${label} navigation appearance. This sheet does not change the production app.`,
            );
          }}
        >
          <Icon name={icon} filled={active === label} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
