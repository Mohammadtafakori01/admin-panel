// src/components/ProtectedRoute.tsx

import { useEffect, useState, ReactElement } from 'react';
import { useRouter } from 'next/router';

const ProtectedRoute = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const ComponentWithAuth: React.FC<P> = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/');
      } else {
        setIsAuthenticated(true);
      }
    }, [router]);

    if (!isAuthenticated) {
      return null; // Optionally, return a loading spinner here
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default ProtectedRoute;
