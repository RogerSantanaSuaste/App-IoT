'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function DeletedParcelasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setHasAccess(false);
        setTimeout(() => router.push('/'), 3000);
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-900/30 text-red-300 p-6 text-center">
        <div className="bg-red-800 border border-red-700 rounded-lg p-6 shadow-lg">
          <h1 className="text-xl font-bold">Acceso Denegado</h1>
          <p className="mt-2">No tienes permiso para acceder a esta página. Serás redirigido en unos segundos...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className='min-h-screen flex items-center justify-center'>Loading...</div>;
  }

  return <div>{children}</div>;
}