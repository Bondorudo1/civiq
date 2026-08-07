import Svg, { Circle } from 'react-native-svg';

/**
 * Decorative water-ripple texture — concentric rings radiating from a point,
 * like a drop hitting still water (the nufăr's habitat). Purely ornamental.
 */
export function WaterTexture({
  width = 230,
  height = 190,
  color = '#8FE0EF',
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  const cx = width * 0.62;
  const cy = height * 0.5;
  const rings = [
    { r: 26, o: 0.4 },
    { r: 48, o: 0.3 },
    { r: 72, o: 0.22 },
    { r: 98, o: 0.15 },
    { r: 126, o: 0.09 },
    { r: 156, o: 0.05 },
  ];

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {rings.map((ring) => (
        <Circle
          key={ring.r}
          cx={cx}
          cy={cy}
          r={ring.r}
          stroke={color}
          strokeWidth={1.6}
          fill="none"
          opacity={ring.o}
        />
      ))}
    </Svg>
  );
}
