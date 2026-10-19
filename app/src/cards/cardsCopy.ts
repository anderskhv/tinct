/**
 * Every word the account cards show. Card words are cards.html's (approved
 * 9 October 2026); the rest is existing Tinct copy, reused where the design
 * has none (errors, empty states, the plan rows), each marked with its source.
 */
export const CARDS_COPY = {
  // cards.html
  you: 'You',
  yourReading: 'Your reading',
  leaderboard: 'Leaderboard',
  aiCredits: 'AI credits',
  usedThisMonth: 'used this month',
  topUpBar: 'Top-up',
  used: 'used',
  topUp: 'Top up',
  findReaders: 'Find readers',
  settings: 'Settings',
  premium: 'Premium',
  free: 'Free',
  uploadPicture: 'Upload a picture',
  choosePicture: 'Choose a picture',
  changeBackground: 'Change background',
  // Anders's feedback, 10 October 2026: the banner's own button
  chooseBackground: 'Choose a background',
  uploadBackground: 'Upload a background',
  useThisPicture: 'Use this picture',
  since: (date: string) => `since ${date}, reading and listening`,
  // Under the last bar of Your reading's week chart (Anders asked what a bar is).
  thisWeek: 'This week',
  last7: 'last 7 days',
  finished: 'finished',
  streak: 'streak',
  readingNow: 'Reading now',
  finishedHeading: 'Finished',
  everyone: 'Everyone',
  lastSevenDays: 'Last 7 days',
  me: 'You',
  searchPlaceholder: 'Name or tinct.app link',
  readingYourBooks: 'Reading your books',
  inviteReader: 'Invite a reader',
  copy: 'Copy',
  share: 'Share…',
  followsYou: 'Follows you',
  more: (n: number) => `${n} more`,
  profile: 'Profile',
  newBooksOpenIn: 'New books open in',
  modern: 'Modern',
  original: 'Original',
  newBooksFoot: 'Modern is Tinct’s English rewrite; Original is the source text or a published translation.',
  account: 'Account',
  email: 'Email',
  password: 'Password',
  signOut: 'Sign out',
  // The You page and Friends page (youPage.ts, friendsPage.ts, profileRules.ts VISIBILITY_COPY), approved 7–8 October 2026
  friends: 'Friends',
  followingYou: 'Following you',
  onlyMe: 'Only me',
  showReading: 'Show what I’m reading',
  showTime: 'Show my reading time',
  thisYear: 'this year',
  tipProfile: ['Who can see you.', ' Only me: nobody else sees your profile or reading. Friends: readers can find your name and picture; people you follow who follow you back see your reading. Everyone: anyone with your link, and the Everyone board.'],
  tipLeaderboard: ['Leaderboard.', ' You appear on the boards of the people who can see you.'],
  // The AI credits row (Anders, 14 October 2026): credits reset; only the subscription renews.
  resets: (date: string) => `Resets ${date}`,
  orWaitUntil: (date: string) => `or wait until ${date}`,
  getPremium: 'Get Premium',
  // A free account after its trial: no allowance this month (15 Oct 2026).
  noCredits: 'None',
  // The You card's name, changed in place (15 Oct 2026); "Name" is the sign-up profile step's label.
  changeName: 'Change name',
  nameLabel: 'Name',
  // labAiAllowance.ts AI_USAGE_COPY
  buyTopUp: 'Buy a $5 top-up',
  buyTopUpMore: 'Buy a $10 top-up',
  topUpFailed: 'Could not open checkout. Try again.',
  // The account page (/sign-in?mode=account) and the reader's old Account sheet
  premiumAccount: 'Premium account',
  freeAccount: 'Free account',
  monthly: 'Monthly',
  monthlyPrice: '$5/month',
  yearly: 'Yearly',
  yearlyPrice: '$50/year',
  paymentFailed: 'Payment could not start. Please try again.',
  // The old Settings sheet (SettingsSheet.tsx): the subscription "Manage" button and Delete account
  manage: 'Manage',
  deleteAccount: 'Delete account',
  deleteConfirm: 'Permanently delete your account and all data?',
  cancel: 'Cancel',
  // The reader's old Account sheet (LabV2Sheet.tsx)
  resetSent: 'Password reset email sent.',
  // You page and Friends page errors and empty states
  saveFailed: 'That did not save. Please try again.',
  actionFailed: 'That did not work. Please try again.',
  // The old Settings' Blocked readers list (youPage.ts)
  unblock: 'Unblock',
  // Find readers lists Friends and Everyone profiles (19 Oct 2026): no longer only "public" ones.
  noSearchResult: 'No reader by that name.',
  waitingRequests: (n: number) => `${n} waiting to be followed back`,
  boardUnavailable: 'The leaderboard is not available just now. Your reading time is safe.',
  // Under the board when friends cannot see you there (19 Oct 2026)
  hiddenOnlyMe: 'Friends don’t see you here: your profile is Only me. Change it in Settings.',
  hiddenTime: 'Friends don’t see you here: turn on Show my reading time in Settings.',
  hiddenLeaderboard: 'Friends don’t see you here: turn on Leaderboard in Settings.',
  linkCopied: 'Link copied.',
  shareUnavailable: 'Sharing is not available here. Copy the link instead.',
  shareTitle: 'Read with me on Tinct',
  shareText: 'Follow me on Tinct and we can see each other’s reading.',
  close: 'Close',
  back: 'Back',
} as const

export const NEUTRAL_READER_NAME = 'Reader'
