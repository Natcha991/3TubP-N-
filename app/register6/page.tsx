export const dynamic = 'force-dynamic';

import RegisterClientPage6 from './register6ClientPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterClientPage6 />
    </Suspense>
  );
}
