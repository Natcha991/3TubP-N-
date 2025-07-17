export const dynamic = 'force-dynamic';

import RegisterClientPage3 from './register3ClientPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterClientPage3 />
    </Suspense>
  );
}
