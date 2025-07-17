export const dynamic = 'force-dynamic';

import RegisterClientPage4 from './register4ClientPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterClientPage4 />
    </Suspense>
  );
}
