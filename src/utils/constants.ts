export enum BattleType {
  STANDARD = 1,
  TRAINING = 2,
  ADVANCE = 21,
  FRONTLINE = 27,
  ONSLAUGHT = 43,
}

export const battleTypeNames = new Map<number, string>([
  [BattleType.STANDARD, 'Standard'],
  [BattleType.TRAINING, 'Training'],
  [BattleType.ADVANCE, 'Advance'],
  [BattleType.FRONTLINE, 'Frontline'],
  [BattleType.ONSLAUGHT, 'Onslaught'],
]);
