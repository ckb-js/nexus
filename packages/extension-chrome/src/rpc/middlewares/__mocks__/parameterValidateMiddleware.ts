const origin = jest.requireActual<typeof import('../parameterValidateMiddleware')>('../parameterValidateMiddleware');

export const parameterValidateMiddleware = jest.fn().mockImplementation(origin.parameterValidateMiddleware);
