// src/pages/Home.js
import React from 'react';
import Navbar from '../components/Layout/Navbar';
import heroImage from '../assets/hero-bg.jpg'; 
import MapKey from '../components/MapKey';
import UserMap from '../components/Map/UserMap';

const Home = () => {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div 
        className="fixed top-0 left-0 w-full h-screen bg-cover bg-center -z-10"
        style={{
          backgroundImage: `url(${heroImage})`
        }}
      >
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h1 className="text-7xl font-bold mb-4 tracking-wider text-shadow-lg">
              FIND THE DIRT
            </h1>
            <p className="text-3xl font-light text-shadow">
              Adventure planning made easy
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative min-h-screen">
        {/* Spacer to push content below hero */}
        <div className="h-screen"></div>

        {/* Content Sections */}
        <div className="bg-white">
          {/* Intro Section */}
          <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold mb-8">Intro</h2>
              <div className="space-y-6 text-gray-700">
                <p>
                  The purpose of the Adventuroads map is to show adventure riders where the dirt roads and tracks are to some degree of accuracy on one map, so you can plan rides to your preference more easily. The roads and tracks are separated into sections as GPX files that are colour coded by surface type. Sections can be selected and downloaded to your device or used to help you plot a route with your own tools.
                </p>
                <p>
                  The map is currently best used on a computer. It is an ongoing project starting with the most popular riding areas and major dirt roads. More tracks and trails will be added over time. Sealed roads will be added if they are great riding or useful to connect dirt sections. All efforts have been made to avoid private roads.
                </p>
                <p>
                  The idea of the map isn't to plan out every detail of your ride - there will always be changes to the plan depending on things like your skill level, weather, closures etc. The map should be considered as a way to avoid the boring roads, give you back up options and get you closer to more trails you can discover that aren't on here yet. The grading of sections should be used as a broad guide - some dirt roads are better than others and some trails are better than roads. If you are heading to more remote areas or challenging tracks it's recommended you do your research.
                </p>
                <p>
                  Improvements will be made with user feedback. If you see some info on the map that's out of date, feel free to let us know with the form below. Likewise if you have ideas for improvements to the function of the map. It is currently free to use all features.
                </p>
              </div>
            </div>
          </section>

          {/* Map Key Section */}
          
              <MapKey />
            </div>

          {/* Map Section */}
          
            
             <UserMap />
          </div>
         
        
        </div>
      
    
  );
};

export default Home;