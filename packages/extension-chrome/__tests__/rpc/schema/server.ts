import { z } from 'zod';
import { methods, addMethodValidator } from '../../../src/rpc/server';
import * as schema from '../../../src/rpc/schema';

describe('server#addMethodValidator', () => {
  it('add method validator', () => {
    const originHandler = jest.fn();
    methods.insert_Paimon = originHandler;
    const fakeRpcMethodSchema = z.any();
    const wrappedHandler = jest.fn();
    const validateSchema = z.object({ name: z.string() });
    const createRpcMethodSchema = jest
      .spyOn(schema, 'createRpcMethodSchema')
      .mockReturnValue(fakeRpcMethodSchema as never);
    const bindSchemaValidator = jest.spyOn(schema, 'bindSchemaValidator').mockReturnValue(wrappedHandler);
    addMethodValidator('insert_Paimon', validateSchema as never);
    expect(createRpcMethodSchema).toBeCalledWith(validateSchema);
    expect(bindSchemaValidator).toBeCalledWith(fakeRpcMethodSchema, originHandler);
    expect(methods.insert_Paimon).toBe(wrappedHandler);
  });
  it('add unregister method validator', () => {
    expect(() => addMethodValidator('add_Paimon', z.object({}) as never)).toThrow(
      'Method add_Paimon is not registered yet. Please call `addMethod` first.',
    );
  });
});
