
import React from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';

const ModelProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Model Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Model ID: {id}</p>
            <p>Model profile details will be displayed here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModelProfile;
