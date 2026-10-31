// Preview-only adapter. Phosphor's installed SVG definitions stay unchanged.
import { createElement, type CSSProperties, type ReactNode, type SVGProps } from 'react';
function normalizeStyle(style: unknown) {
  return Array.isArray(style)
    ? (Object.assign({}, ...style.filter(Boolean)) as CSSProperties)
    : (style as CSSProperties);
}
function Svg({
  children,
  style,
  testID: _testID,
  ...props
}: SVGProps<SVGSVGElement> & { children?: ReactNode; testID?: string }) {
  return createElement('svg', { ...props, style: normalizeStyle(style) }, children);
}
export default Svg;
export function Path(props: SVGProps<SVGPathElement>) {
  return createElement('path', props);
}
export function Circle(props: SVGProps<SVGCircleElement>) {
  return createElement('circle', props);
}
export function Rect(props: SVGProps<SVGRectElement>) {
  return createElement('rect', props);
}
export function Line(props: SVGProps<SVGLineElement>) {
  return createElement('line', props);
}
export function Polyline(props: SVGProps<SVGPolylineElement>) {
  return createElement('polyline', props);
}
export function Polygon(props: SVGProps<SVGPolygonElement>) {
  return createElement('polygon', props);
}
export function Ellipse(props: SVGProps<SVGEllipseElement>) {
  return createElement('ellipse', props);
}
export function G(props: SVGProps<SVGGElement>) {
  return createElement('g', props);
}
