
import React from 'react';
import PropTypes from 'prop-types';
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
          <span className="inline-block w-2 h-2 bg-green-500 mr-2"></span>
          Elevation: {payload[0].value}m
        </p>
      </div>
    );
  }
  return null;
};

const ElevationChart = ({ route }) => {
  if (!route) {
    return <p className="text-gray-500">Select a route to see details</p>;
  }

  const { name, roadType, notes, stats } = route.properties;
  const { totalDistance, maxElevation, minElevation } = stats || {};

  const elevationData = route.geometry.coordinates.map((coord, index) => ({
    point: index,
    elevation: Math.round(coord[2] || 0)
  }));

  return (
    <div className="space-y-4">
      {/* ... */}

      {stats && (
        <div className="bg-white shadow rounded-lg p-4">
          {/* ... */}

          <div className="mt-6">
            <h6 className="text-lg font-bold mb-2">Elevation Profile</h6>
            <div className="h-64 w-full bg-white">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={elevationData}
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
                        <span className="inline-block w-3 h-3 bg-green-500 mr-2"></span>
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
        </div>
      )}
    </div>
  );
};

// ...

export default ElevationChart;