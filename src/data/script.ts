export const SCRIPT = {
  hook: 'Whoever stays inside this box the longest wins $10,000!',
  catch: 'But there’s one catch…',
  rule: 'Every 5 minutes, the box gets smaller.',
  protest: 'Bro, there’s no way!',
  resolve: 'I’m not leaving!',
  elapsed: 'They’ve already been here for 30 minutes…',
  finalCall: 'And now… there’s only enough space for ONE person.',
  money: 'I NEED THIS MONEY!',
  actually: 'Actually…',
  revealIntro: 'The $10,000 is going to…',
  reveal: '…the person who lasted the longest.',
  win: 'HE JUST WON $10,000!',
  question: 'Would you survive?',
} as const;

export type ScriptKey = keyof typeof SCRIPT;

