export const dynamic = 'force-dynamic';

import RegisterClientPage7 from './register7ClientPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterClientPage7 />
    </Suspense>
  );
}
