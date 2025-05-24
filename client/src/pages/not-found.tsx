
import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">404 - Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">The page you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
