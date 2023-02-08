export type CreateFlowRouteConfig = {
  flow: string[];
  entry: string;
  exit: string;
  disableBackOnExit?: boolean;
  exitButtonText?: string;
};
