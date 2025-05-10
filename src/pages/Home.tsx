// src/pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, BookOpen } from "lucide-react";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl shadow-xl overflow-hidden rounded-3xl">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Brand Section */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 md:w-2/5 p-8 text-white flex flex-col justify-center items-center">
            <div className="mb-6">
              {/* Logo */}
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                <span className="text-indigo-700 text-3xl font-bold">MEC</span>
              </div>
            </div>
            <div className="flex flex-row space-x-2.5">
              <div className="flex-col mb-4">
                <h3 className="text-xl font-bold">MagMax</h3>
                <h3 className="text-xl font-bold">Educational</h3>
                <h3 className="text-xl font-bold">Centre</h3>
              </div>
              <div className="text-indigo-100 text-center mb-4">
                <img src="../../public/icon-512-512.png" className="w-24 h-24" alt="MEC Logo" />
              </div>
            </div>
          </div>
          
          {/* Right side - Content Section */}
          <CardContent className="md:w-3/5 p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Akwaaba to MEC Connect</h3>
            <div className="h-1 w-16 bg-purple-600 mb-6"></div>
            
            <p className="text-gray-600 mb-8">
              Our platform connects teachers and students at MagMax Educational Centre, providing tools for seamless learning and collaboration.
            </p>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Choose your role</h3>
              <p className="text-gray-500 text-sm mb-4">
                Select your role to access personalized resources and tools
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/teacher-selection"
                className="group"
              >
                <Card className="border-2 border-indigo-600 hover:bg-indigo-50 transition duration-300">
                  <CardContent className="p-4 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                      <GraduationCap className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Teacher</h3>
                      <p className="text-sm text-gray-500">Manage classes & resources</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link
                to="/students"
                className="group"
              >
                <Card className="border-2 border-purple-600 hover:bg-purple-50 transition duration-300">
                  <CardContent className="p-4 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Student</h3>
                      <p className="text-sm text-gray-500">Access learning materials</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
            
            <div className="mt-8 pt-6">
              <Separator className="mb-6" />
              <p className="text-sm text-gray-500">
                Need help? <Link to="/support" className="text-indigo-600 font-medium hover:text-indigo-800">Contact support</Link>
              </p>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default Home;