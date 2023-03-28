export const WalletManagerPageTextInfo = {
  ImportWallet: 'Import wallet',
  CreateANewWallet: 'Create a new wallet',
};

export const ImportWalletPageTextInfo = {
  getWorldByIdx: (num: number): string => `Word ${num}`,
  password: 'Password',
  recovery: 'Recovery',
};
export const CreateANewWalletPageTextInfo = {
  back: 'Back',
  next: 'Next',
  NewPassword: 'New password (8 characters minimum)',
  ConfirmPassword: 'Confirm password',
  Create: 'Create',
};

export const WalletManagerPageTestIdInfo = {
  /**
   *  Page 1: New to nexus
   *     test-id: createWallet on 'Create a wallet button'
   *     test-id: importWallet on 'Import wallet button'
   */
  CreateWallet: 'createWallet',
  ImportWallet: 'importWallet',

  /**
   *     Page 2: get started
   *
   *     test-id: getStarted, the 'get started' button
   */

  GetStarted: 'getStarted',

  /**
   *
   *  Page 3 create account
   *
   *     test-id: userName, the 'user name' input
   *     test-id: back，the 'back button'
   *     test-id: next, the 'next' button
   *
   */

  UserName: 'username',
  Back: 'back',
  Next: 'next',

  /**
   * Page 4 create password
   *
   * test-id: password, the password input
   * test-id: confirm-password, the confirm password input
   * test-id: aggreeTermsOfUse the checkbox item
   * test-id: back，the 'back button'
   * test-id: next, the 'next' button
   *
   */

  Password: 'password',
  ConfirmPassword: 'confirm-password',
  AggreeTermsOfUse: 'aggreeTermsOfUse',
  // back
  // next

  /**
   * Page 5, wallet generation seed
   *  test-id: seed#n, the nth seed item
   *  test-id: copyToClipboard, the copy to clipboard button
   *  test-id: back，the 'back button'
   *  test-id: next, the 'next' button
   *
   */

  Seed: 'seed',
  getSeedByIdx: (num: number): string => `seed[${num}]`,
  CopyToClipboard: 'copyToClipboard',
  // back
  // next

  /**
   *
   *     test-id: selectedSeed#n, when the user select a seed, the seed will appear in top of the page
   *     test-id: seed#n, the seed waiting for select. a extra boolean attribute named seed-selected tells the seed selected status
   *     test-id: back，the 'back button'
   *     test-id: next, the 'next' button
   */

  getSelectedSeedByIdx: (num: number): string => `selectedSeed#${num}`,
  // seed#n
  // back
  // next

  /**
   * Page7, all down, conguratulations
   *
   *      test-id: done, the 'all done' button
   */

  Done: 'done',

  /**
   * Page 8, import wallet
   *
   *    test-id: seed#1, seed#2, ... seed#n the seed input for the recovery, n means the index
   *    test-id: back，the 'back button'
   *    test-id: next, the 'next' button
   */
};
