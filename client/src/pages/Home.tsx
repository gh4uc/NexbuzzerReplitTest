
import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';

const Home: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Nexbuzzer
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with models for voice and video calls
          </p>
          <div className="space-x-4">
            <Link href="/discover">
              <Button size="lg">
                Discover Models
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Voice Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Connect with models through high-quality voice calls</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Video Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Experience face-to-face interactions with video calling</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Secure Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Safe and secure platform for all your interactions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
