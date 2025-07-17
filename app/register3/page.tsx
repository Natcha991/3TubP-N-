export const dynamic = 'force-dynamic';

import RegisterClientPage from './register3ClientPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterClientPage />
    </Suspense>
  );
}
