export enum BattleTypes {
  STANDARD = 1,
  TRAINING = 2,
  ADVANCE = 21,
  FRONTLINE = 27,
  ONSLAUGHT = 43,
}

export const battleTypeNames = new Map<number, string>([
  [BattleTypes.STANDARD, 'Standard'],
  [BattleTypes.TRAINING, 'Training'],
  [BattleTypes.ADVANCE, 'Advance'],
  [BattleTypes.FRONTLINE, 'Frontline'],
  [BattleTypes.ONSLAUGHT, 'Onslaught'],
]);
