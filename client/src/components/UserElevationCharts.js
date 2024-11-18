import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const ElevationChart = ({ data }) => {
  if (!data?.length) return null;

  // Calculate total distance from coordinates
  const totalDistance = data.length > 1 ? 
    data.reduce((acc, coord, i) => {
      if (i === 0) return 0;
      const prevCoord = data[i - 1];
      const dist = Math.sqrt(
        Math.pow(coord[0] - prevCoord[0], 2) + 
        Math.pow(coord[1] - prevCoord[1], 2)
      ) * 111; // Rough conversion to kilometers
      return acc + dist;
    }, 0) : 0;

  // Sample the data to reduce points and smooth the chart
  const sampleRate = Math.max(1, Math.floor(data.length / 100));
  const elevationData = data
    .filter((_, i) => i % sampleRate === 0)
    .map((coord, i) => ({
      distance: ((i * sampleRate) / data.length * totalDistance).toFixed(1),
      elevation: Math.round(coord[2] || 0)
    }));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer>
        <LineChart data={elevationData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="distance"
            tick={{ fontSize: 10 }}
            tickFormatter={v => `${v}km`}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={v => `${v}m`}
            domain={['dataMin', 'dataMax']}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white p-2 border shadow-lg text-xs">
                  <p>Distance: {payload[0].payload.distance}km</p>
                  <p>Elevation: {payload[0].value}m</p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="elevation"
            stroke="#4B8BF4"
            dot={false}
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ElevationChart;