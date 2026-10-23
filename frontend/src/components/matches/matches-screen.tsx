'use client';

import { useState } from 'react';
import { Plus, Swords } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { useClubs } from '@/hooks/data/clubs';
import { NewMatchDialog } from './new-match-dialog';

export function MatchesScreen() {
  const [creating, setCreating] = useState(false);
  const clubs = useClubs();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Swords}
        title="Partidas"
        description="Jogue partidas entre clubes com os 5 titulares escalados e acompanhe o histórico."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus data-icon="inline-start" />
            Nova partida
          </Button>
        }
      />
      <NewMatchDialog
        open={creating}
        clubs={clubs.data ?? []}
        onOpenChange={setCreating}
      />
    </div>
  );
}
