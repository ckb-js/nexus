export type StepConfig = {
  path: string;
  title: string;
  description?: string;

  /**
   * if true, the next page will only trigger the `onNext` callback, and outlet will not call `onNext`
   */
  displayOnly?: boolean;
};

export type CreateFlowConfig = {
  steps: StepConfig[];
  entry: string;
  exit: string;
  disableBackOnExit?: boolean;
  exitButtonText?: string;
};
