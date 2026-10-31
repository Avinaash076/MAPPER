import {
  ArrowRightIcon,
  BankIcon,
  BookmarkSimpleIcon,
  CameraIcon,
  CheckIcon,
  ClockIcon,
  CompassIcon,
  CrosshairIcon,
  FlowerLotusIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MoonIcon,
  PathIcon,
  PersonSimpleWalkIcon,
  PlusIcon,
  StackIcon,
  SunIcon,
  TreeIcon,
  WarningCircleIcon,
  WavesIcon,
} from 'phosphor-react-native';

const icons = {
  compass: CompassIcon,
  bookmark: BookmarkSimpleIcon,
  path: PathIcon,
  pin: MapPinIcon,
  search: MagnifyingGlassIcon,
  layers: StackIcon,
  tree: TreeIcon,
  waves: WavesIcon,
  heritage: BankIcon,
  spiritual: FlowerLotusIcon,
  activity: PersonSimpleWalkIcon,
  arrow: ArrowRightIcon,
  plus: PlusIcon,
  check: CheckIcon,
  clock: ClockIcon,
  warning: WarningCircleIcon,
  camera: CameraIcon,
  locate: CrosshairIcon,
  list: ListBulletsIcon,
  sun: SunIcon,
  moon: MoonIcon,
};
export type IconName = keyof typeof icons;
export function Icon({
  name,
  filled = false,
  size = 24,
}: {
  name: IconName;
  filled?: boolean;
  size?: number;
}) {
  const PhosphorIcon = icons[name];
  return (
    <span aria-hidden="true" className="themed-icon">
      <PhosphorIcon size={size} color="currentColor" weight={filled ? 'fill' : 'regular'} />
    </span>
  );
}
