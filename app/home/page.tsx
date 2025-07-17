import { Suspense } from 'react';
import HomePage from './HomeClientPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}