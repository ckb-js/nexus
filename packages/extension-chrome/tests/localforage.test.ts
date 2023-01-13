import { describe, expect, test, beforeEach } from '@jest/globals';
import localforage from 'localforage';
import { createDriver } from '../src/localforage/driver';

const memDriver = createDriver();
localforage.defineDriver(memDriver);
const instance = localforage.createInstance({ driver: 'memDriver' });

beforeEach(async () => {
  await instance.clear();
});

describe('localforage customized driver', () => {
  test('initial db should be empty', async () => {
    const length = await instance.length();
    const keys = await instance.keys();
    const key1 = await instance.key(1);
    expect(length).toBe(0);
    expect(keys).toEqual([]);
    expect(key1).toBe(undefined);
  });

  test('get non exsit key should return null', async () => {
    const value = await instance.getItem('not defined');
    expect(value).toEqual(null);
  });

  test('should setItem success', async () => {
    await instance.setItem('name', 'jack');
    await instance.setItem('age', 12);
    await instance.setItem('dog', { name: 'Nemo', color: 'yellow' });

    const name = await instance.getItem('name');
    const age = await instance.getItem('age');
    const dog = await instance.getItem('dog');

    expect(name).toEqual('jack');
    expect(age).toEqual(12);
    expect(dog).toEqual({ name: 'Nemo', color: 'yellow' });
    expect(await instance.length()).toEqual(3);
  });

  test('should remove success', async () => {
    await instance.setItem('name', 'jack');
    await instance.removeItem('name');
    const name = await instance.getItem('name');

    expect(name).toEqual(null);
  });

  test('should iterate', async () => {
    await instance.setItem('1', 1);
    await instance.setItem('2', 2);
    await instance.setItem('3', 3);
    await instance.setItem('4', 4);
    let sum = 0;
    await instance.iterate((value, _key, _i) => {
      sum += value as number;
    });
    expect(sum).toEqual(10);
  });

  test('should iterate early return', async () => {
    const numArr = [1, 2, 3, 4];
    await instance.setItem('1', numArr[0]);
    await instance.setItem('2', numArr[1]);
    await instance.setItem('3', numArr[2]);
    await instance.setItem('4', numArr[3]);
    let sum = 0;
    await instance.iterate((value, _key, i) => {
      sum += value as number;
      // return when i === 2, so 0,1,2 is iterated
      if (i === 2) {
        return i;
      }
    });
    expect(sum).toEqual(numArr[0] + numArr[1] + numArr[2]); //6
  });
});
