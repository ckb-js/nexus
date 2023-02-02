import { Script, Transaction } from '@ckb-lumos/base';
import { publicKeyToBlake160 } from '@ckb-lumos/hd/lib/key';
import { getGroupedHash } from '../../src/services/backend/utils';

const fixtures: { pubkey: string; lock: Script }[] = new Array(50).fill(0).map((_, i) => ({
  pubkey: `0x${String(i).padStart(2, '0').repeat(33)}`,
  lock: {
    args: publicKeyToBlake160(`0x${String(i).padStart(2, '0').repeat(33)}`),
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    hashType: 'type',
  },
}));

it('utils# should get grouped hash', () => {
  const mockTx: Transaction = {
    headerDeps: [],
    outputsData: [],
    version: '0x01',
    inputs: [
      {
        previousOutput: {
          index: '0x0',
          txHash: '0x45def2fa2371895941e9e0b26ef9c27dca3ab446238548a472fed3b8ccc799f6',
        },
        since: '0x0',
      },
      {
        previousOutput: {
          index: '0x0',
          txHash: '0x9fb88345432208ea1182987ff62b7911de877e74c8016cf4af5168815ce30480',
        },
        since: '0x0',
      },
    ],
    outputs: [
      {
        capacity: '0x28fa6ae00',
        lock: {
          args: '0xed20af7322823d0dc33bfb215486a05082669905',
          codeHash: '0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8',
          hashType: 'type',
        },
      },
      {
        capacity: '0x2186f9360',
        lock: {
          args: '0x92764594e255afbb89cd9486b0035c393b2c5323',
          codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
          hashType: 'type',
        },
      },
    ],
    cellDeps: [
      {
        outPoint: {
          txHash: '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
          index: '0x0',
        },
        depType: 'depGroup',
      },
    ],
    witnesses: ['0x0001', '0x1234'],
  };

  const mockAddressInfos = [
    {
      path: `m/44'/309'/0'/0/0`,
      addressIndex: 0,
      pubkey: '',
      blake160: '',
      lock: fixtures[0].lock,
    },
    {
      path: `m/44'/309'/0'/0/1`,
      addressIndex: 0,
      pubkey: '',
      blake160: '',
      lock: fixtures[1].lock,
    },
  ];

  const groupedHash = getGroupedHash(mockTx, mockAddressInfos);
  expect(groupedHash).toEqual([
    [mockAddressInfos[0], '0x5f1cbd06e2a0dcac0bbf67bdfe8256cdf6a503dfaad145dd94e0b48f1edf637b'],
    [mockAddressInfos[1], '0xdaf81b611585494feba319dfb4b6c4169f26377fe50571851cb59ecf19957c0a'],
  ]);
});
