'use client';

import * as React from 'react';

type ClientCpnProps = {
  ssr?: React.ReactNode;
  children: React.ReactNode;
};


export default function ClientCpn({ ssr = null, children }: ClientCpnProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{ssr}</>;
  return <>{children}</>;
}
