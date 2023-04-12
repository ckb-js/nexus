import path from 'path';

export const PROJECT_ROOT_PATH = path.join(__dirname, '../../');
export const NEXUS_BUILD_PATH = path.join(PROJECT_ROOT_PATH, 'packages/extension-chrome/build');
export const E2E_ROOT_PATH = path.join(PROJECT_ROOT_PATH, 'e2e');
export const PERSISTENT_PATH = path.join(E2E_ROOT_PATH, 'tmp/test-user-data-dir');
