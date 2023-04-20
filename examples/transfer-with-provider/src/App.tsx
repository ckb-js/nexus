import { useCells, useProvider } from './hooks/useProvider';
import { useState } from 'react';
import { BI, formatUnit, parseUnit } from '@ckb-lumos/bi';
import { createTransactionFromSkeleton, parseAddress, TransactionSkeleton } from '@ckb-lumos/helpers';
import { predefined } from '@ckb-lumos/config-manager';
import { RPC, config } from '@ckb-lumos/lumos';

config.initializeConfig(predefined.AGGRON4);

export function App() {
  const provider = useProvider();
  const [nickname, setNickname] = useState<string>();

  async function connect() {
    const { nickname } = await provider.enable();
    setNickname(nickname);
  }

  if (!nickname) {
    return <button onClick={connect}>Connect</button>;
  }

  return (
    <div>
      <h1>Hi, {nickname}</h1>
      <CellAnalysis />
    </div>
  );
}

function CellAnalysis() {
  const cells = useCells();

  const total = cells.reduce((acc, cell) => acc.add(cell.cellOutput.capacity), BI.from(0));

  return (
    <div>
      <h2>
        {cells.length} cells in wallet with total {formatUnit(total, 'ckb')} CKB
      </h2>
      <div>
        <Transfer />
      </div>
    </div>
  );
}

function Transfer() {
  const provider = useProvider();
  const [amount, setAmount] = useState('100');
  const [receiverAddress, setReceiverAddress] = useState(
    'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqt8jlmrqq3q0wpw3rd242w0e2c8rf6nxcgegx8sh',
  );

  async function transfer() {
    let txSkeleton = TransactionSkeleton({});
    const receiveShannon = parseUnit(amount, 'ckb');

    const receiverCell = {
      cellOutput: {
        capacity: receiveShannon.toHexString(),
        lock: parseAddress(receiverAddress, { config: predefined.AGGRON4 }),
      },
      data: '0x',
    };

    // put receiver cell into outputs of the transaction
    txSkeleton = txSkeleton.update('outputs', (outputs) => outputs.push(receiverCell));

    txSkeleton = await provider.injectCapacity(txSkeleton, { amount: receiveShannon });
    txSkeleton = await provider.payFee(txSkeleton, { autoInject: true });
    txSkeleton = await provider.signTransaction(txSkeleton);

    const rpc = new RPC('https://testnet.ckb.dev');
    const txHash = await rpc.sendTransaction(createTransactionFromSkeleton(txSkeleton));

    console.log(txHash);
  }

  return (
    <div>
      Transfer to:
      <div>
        amount: <input placeholder="111 CKB" type="number" onChange={(e) => setAmount(e.target.value)} value={amount} />
      </div>
      <div>
        to: <input placeholder="address" onChange={(e) => setReceiverAddress(e.target.value)} value={receiverAddress} />
      </div>
      <button onClick={transfer}>Transfer</button>
    </div>
  );
}
