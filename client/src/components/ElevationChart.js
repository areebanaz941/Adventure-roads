// src/components/ElevationChart.js
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-2 rounded shadow-lg text-sm">
        <p>Point: {label}</p>
        <p className="flex items-center">
          <span className="inline-block w-2 h-2 bg-[#4CAF50] mr-2"></span>
          Elevation: {payload[0].value}m
        </p>
      </div>
    );
  }
  return null;
};

const ElevationChart = ({ data }) => {
  const chartData = data.map((coord, index) => ({
    point: index,
    elevation: Math.round(coord[2] || 0)
  }));

  return (
    <div className="space-y-4">
      <div className="h-64 w-full bg-white">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 30, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e0e0e0"
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="point" 
              stroke="#666"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => value * 15} // Adjust scale as needed
            />
            <YAxis 
              domain={[0, 'auto']}
              stroke="#666"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top"
              height={30}
              content={({ payload }) => (
                <div className="flex justify-center items-center text-sm">
                  <span className="inline-block w-3 h-3 bg-[#4CAF50] mr-2"></span>
                  Elevation
                </div>
              )}
            />
            <Line 
              type="monotone"
              dataKey="elevation"
              stroke="#4CAF50"
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 4, 
                stroke: '#4CAF50', 
                strokeWidth: 2, 
                fill: 'white' 
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      
    </div>
  );
};

export default ElevationChart;