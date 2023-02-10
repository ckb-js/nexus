export type StepConfig = {
  path: string;
  title: string;
  description?: string;
};

export type CreateFlowConfig = {
  steps: StepConfig[];
  entry: string;
  exit: string;
  disableBackOnExit?: boolean;
  exitButtonText?: string;
};
