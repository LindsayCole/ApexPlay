import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';

interface DataPoint {
  timestamp: number;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  width: number;
  height: number;
  color?: string;
  strokeWidth?: number;
  timeRangeMs?: number;
}

const LineChartComponent: React.FC<LineChartProps> = ({
  data,
  width,
  height,
  color = '#a855f7', // purple-500
  strokeWidth = 2,
  timeRangeMs = 5 * 60 * 1000,
}) => {
  if (!data || data.length < 2) {
    return (
      <View style={{ width, height }} className="flex-1 items-center justify-center">
        <Text className="text-gray-500 text-sm">Waiting for data...</Text>
      </View>
    );
  }

  const padding = { top: 10, right: 10, bottom: 20, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const now = Date.now();
  const startTime = now - timeRangeMs;

  const maxVal = Math.max(...data.map(p => p.value), 0) * 1.2;
  const minVal = 0;

  const getX = (timestamp: number) => {
    const timeRatio = (timestamp - startTime) / timeRangeMs;
    return padding.left + timeRatio * chartWidth;
  };

  const getY = (value: number) => {
    const valueRatio = (maxVal > minVal) ? (value - minVal) / (maxVal - minVal) : 0;
    return padding.top + chartHeight * (1 - valueRatio);
  };

  const pathData = data
    .map((point, i) => {
      const x = getX(point.timestamp);
      const y = getY(point.value);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const yAxisLabels = [0, maxVal / 2, maxVal].map(val => ({
    value: val.toFixed(1),
    y: getY(val),
  }));

  return (
    <Svg width={width} height={height}>
      {yAxisLabels.map(label => (
        <React.Fragment key={label.value}>
          <Line
            x1={padding.left} y1={label.y}
            x2={width - padding.right} y2={label.y}
            stroke="#4b5563"
            strokeWidth="0.5"
            strokeDasharray="2,3"
          />
          <SvgText
            x={padding.left - 8} y={label.y}
            textAnchor="end"
            alignmentBaseline="middle"
            fontSize="10"
            fill="#9ca3af"
          >
            {label.value}
          </SvgText>
        </React.Fragment>
      ))}

       <SvgText x={padding.left} y={height - 5} textAnchor="start" fontSize="10" fill="#9ca3af">5 min ago</SvgText>
       <SvgText x={width - padding.right} y={height - 5} textAnchor="end" fontSize="10" fill="#9ca3af">Now</SvgText>

      <Path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const LineChart = React.memo(LineChartComponent);