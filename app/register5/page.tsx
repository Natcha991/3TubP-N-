export const dynamic = 'force-dynamic';

import RegisterClientPage5 from './register5ClientPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterClientPage5 />
    </Suspense>
  );
}
