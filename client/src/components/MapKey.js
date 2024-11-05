// src/components/MapKey.js
import React from 'react';

const MapKey = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Map Key</h2>
        
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Surface Types */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Surface Type</h3>
            <div className="flex flex-col gap-2">
              <div className="flex">
                <div className="bg-road-sealed rounded-l-md text-white text-center py-2 px-4 w-32">
                  Sealed<br />Road
                </div>
                <div className="bg-road-gravel text-white text-center py-2 px-4 w-32">
                  Gravel/Dirt<br />Road
                </div>
                <div className="bg-road-track text-white text-center py-2 px-4 w-32">
                  Track/Trail
                </div>
                <div className="bg-road-sand text-black text-center py-2 px-4 w-32">
                  Sand
                </div>
                <div className="bg-road-undefined rounded-r-md text-black text-center py-2 px-4 w-32">
                  Not Yet<br />Defined
                </div>
              </div>
            </div>
          </div>

          {/* Points of Interest */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Points of Interest</h3>
            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-2">
                <img 
                  src="/images/accommodation.png" 
                  alt="Accommodation/Pub" 
                  className="w-8 h-8"
                />
                <span className="text-sm">Accomm/Pub</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img 
                  src="/images/fuel.png" 
                  alt="Fuel" 
                  className="w-8 h-8"
                />
                <span className="text-sm">Fuel</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img 
                  src="/images/danger.png" 
                  alt="Danger/Hazard" 
                  className="w-8 h-8"
                />
                <span className="text-sm">Danger/Hazard</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img 
                  src="/images/camping.png" 
                  alt="Camping" 
                  className="w-8 h-8"
                />
                <span className="text-sm">Camping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapKey;