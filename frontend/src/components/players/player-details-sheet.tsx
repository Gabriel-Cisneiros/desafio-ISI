'use client';

import {
  ChartColumn,
  Coins,
  HeartPulse,
  Pencil,
  ShoppingCart,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { ConditionBadge } from '@/components/shared/condition-badge';
import { PlayerAvatar } from '@/components/shared/player-avatar';
import { StatCard } from '@/components/shared/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { Club } from '@/lib/api/types/club';
import type { Player, PlayerAttributes } from '@/lib/api/types/player';
import { formatMoney } from '@/lib/format';
import type { PlayerActionHandlers } from './player-actions';

const ATTRIBUTE_SCALE = 99;

const ATTRIBUTES: { key: keyof PlayerAttributes; label: string }[] = [
  { key: 'pace', label: 'Velocidade' },
  { key: 'shooting', label: 'Finalização' },
  { key: 'passing', label: 'Passe' },
  { key: 'dribbling', label: 'Drible' },
  { key: 'defending', label: 'Defesa' },
  { key: 'physical', label: 'Físico' },
];

const percent = (value: number) => `${(value / ATTRIBUTE_SCALE) * 100}%`;

interface PlayerDetailsSheetProps extends Pick<
  PlayerActionHandlers,
  'onEdit' | 'onChangeCondition' | 'onBuy'
> {
  player: Player | undefined;
  club: Club | undefined;
  onClose: () => void;
}

export function PlayerDetailsSheet({
  player,
  club,
  onClose,
  onEdit,
  onChangeCondition,
  onBuy,
}: PlayerDetailsSheetProps) {
  return (
    <Sheet
      open={player !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent className="gap-0 overflow-y-auto data-[side=right]:sm:max-w-120">
        {player && (
          <>
            <SheetHeader className="flex-row items-center gap-3 p-6 pr-12">
              <PlayerAvatar id={player.id} name={player.name} size="lg" />
              <div className="flex flex-col gap-1.5">
                <SheetTitle className="text-lg font-semibold">
                  {player.name}
                </SheetTitle>
                <SheetDescription asChild>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{player.position}</Badge>
                    <ConditionBadge condition={player.condition} />
                    <Badge variant="secondary">
                      {club ? club.acronym : 'Livre'}
                    </Badge>
                  </div>
                </SheetDescription>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-6 pb-6">
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Valor de mercado"
                  icon={Coins}
                  value={formatMoney(player.market_value)}
                  description="Calculado automaticamente"
                />
                <StatCard
                  label="Valor base"
                  icon={Tag}
                  value={formatMoney(player.base_value)}
                  description="Calculado no cadastro"
                />
                <StatCard
                  label="Overall"
                  icon={ChartColumn}
                  value={player.overall}
                  description="Calculado pela posição"
                />
                <StatCard
                  label="Potencial"
                  icon={TrendingUp}
                  value={player.potential}
                  description="Informado no cadastro"
                />
              </div>

              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Indicadores técnicos</h3>
                  <span className="text-xs text-muted-foreground">
                    Escala de 1 a {ATTRIBUTE_SCALE}
                  </span>
                </div>
                <dl className="flex flex-col gap-2.5">
                  {ATTRIBUTES.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-4">
                      <dt className="w-24 text-muted-foreground">{label}</dt>
                      <dd className="relative h-1.5 flex-1 rounded-full bg-muted">
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 rounded-full bg-chart-2"
                          style={{ width: percent(player.potential) }}
                        />
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 rounded-full bg-chart-1"
                          style={{ width: percent(player[key]) }}
                        />
                      </dd>
                      <dd className="w-6 text-right font-medium">
                        {player[key]}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-xs bg-chart-1" />
                    Valor do atributo
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-xs bg-chart-2" />
                    Até o potencial ({player.potential}), que nenhum atributo
                    passa
                  </span>
                </div>
              </section>

              <dl className="divide-y rounded-lg border">
                {[
                  ['Idade', `${player.age} anos`],
                  ['Agilidade', player.agility],
                  ['Clube', club ? club.name : 'Livre'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <SheetFooter className="flex-row flex-wrap gap-2 border-t p-6">
              <Button variant="outline" onClick={() => onEdit(player)}>
                <Pencil data-icon="inline-start" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => onChangeCondition(player)}
              >
                <HeartPulse data-icon="inline-start" />
                Alterar condição
              </Button>
              {player.club_id === null && (
                <Button className="ml-auto" onClick={() => onBuy(player)}>
                  <ShoppingCart data-icon="inline-start" />
                  Comprar
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
