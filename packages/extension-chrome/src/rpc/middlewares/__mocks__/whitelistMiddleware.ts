const origin = jest.requireActual<typeof import('../whitelistMiddleware')>('../whitelistMiddleware');

export const whitelistMiddleware = jest.fn().mockImplementation(origin.whitelistMiddleware);
