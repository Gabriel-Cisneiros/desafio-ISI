const FIELD_LABELS: Record<string, string> = {
  name: 'nome',
  acronym: 'sigla',
  position: 'posição',
  agility: 'agilidade',
  age: 'idade',
  pace: 'velocidade',
  shooting: 'finalização',
  passing: 'passe',
  dribbling: 'drible',
  defending: 'defesa',
  physical: 'físico',
  potential: 'potencial',
  condition: 'condição',
  club_id: 'clube',
  loyalty_until: 'fim da fidelidade',
  home_club_id: 'mandante',
  away_club_id: 'visitante',
  formation: 'formação',
  player_ids: 'jogadores',
};

export function fieldLabel(property: string): string {
  return FIELD_LABELS[property] ?? property;
}
