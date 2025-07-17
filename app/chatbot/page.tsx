import { Suspense } from 'react';
import ChatClientPage from './ChatClientPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatClientPage />
    </Suspense>
  );
}