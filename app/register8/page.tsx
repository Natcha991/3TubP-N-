export const dynamic = 'force-dynamic';

import RegisterClientPage8 from './register8ClientPage';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterClientPage8 />
    </Suspense>
  );
}
