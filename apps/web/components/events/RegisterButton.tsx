'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { RegisterModal } from '@/components/events/RegisterModal';

/** Client wrapper that opens the registration modal from server pages. */
export function RegisterButton({ event }: { event: { id: string; title: string; slug: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full" size="md" arrow>
        Register for This Event
      </Button>
      <RegisterModal open={open} onClose={() => setOpen(false)} event={event} />
    </>
  );
}
