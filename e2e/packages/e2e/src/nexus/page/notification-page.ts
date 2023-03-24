export const NotificationPageTextInfo = {
  Approve: 'Approve',
  Connect: 'connect',
  Cancel: 'cancel',
};

export const SignMessagePageTestIdInfo = {
  /**
   * test-id: reject, the rejrect button
   * test-id: sign, the sign button
   * test-id: password, the password input
   * test-id: submitPassword, the submit password button
   * test-id: url, the requester url
   * tes-tid: message, the message for sigining
   */

  Reject: 'reject',
  Sign: 'sign',
  Password: 'password',
  SubmitPassword: 'submitPassword',
  Url: 'url',
  Message: 'message',

  TransactionInputs: 'transaction.inputs',
  getTransactionInputByIdx: (idx: number): string => `transaction.inputs[${idx}]`,
  getTransactionInputAddressByIdx: (idx: number): string => `transaction.inputs[${idx}].address`,
  getTransactionInputTypeByIdx: (idx: number): string => `transaction.inputs[${idx}].type`,
  getTransactionInputCapacityByIdx: (idx: number): string => `transaction.inputs[${idx}].capacity`,

  TransactionOutputs: 'transaction.outputs',
  getTransactionOutPutByIdx: (idx: number): string => `transaction.outputs[${idx}]`,
  getTransactionOutputAddressByIdx: (idx: number): string => `transaction.outputs[${idx}].address`,
  getTransactionOutputTypeByIdx: (idx: number): string => `transaction.outputs[${idx}].type`,
  getTransactionOutputCapacityByIdx: (idx: number): string => `transaction.outputs[${idx}].capacity`,
};

export const GrantPageTestIdInfo = {
  /**
   * Anchors:
   *
   * test-id: grant the grant button
   * test-id: reject the reject button
   */

  Grant: 'grant',
  Reject: 'reject',
};
