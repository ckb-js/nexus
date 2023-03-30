/* eslint-disable */
import { observer } from 'mobx-react-lite';
import { useStore } from './ckb';

function connectionSection(injectedCkbService) {
  return (
    <section>
      <div className="row d-flex justify-content-center">
        <div className="col-xl-4">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Basic Actions</h4>
              <p className="info-text alert  alert-secondary">
                nexus version: <span id="ckbVersion">{injectedCkbService.ckbWalletVersion}</span>
              </p>
              <button
                className="btn btn-primary btn-lg btn-block mb-3"
                id="connectButton"
                onClick={injectedCkbService.wallet_enable}
                disabled={injectedCkbService.enableStatus}
              >
                {injectedCkbService.enableStatus ? 'linked' : 'connect'}
              </button>

              {/*<button*/}
              {/*  className="btn btn-primary btn-lg btn-block mb-3"*/}
              {/*  id="getNetworkName"*/}
              {/*  onClick={injectedCkbService.getNetworkName}*/}
              {/*  disabled={!injectedCkbService.enableStatus}*/}
              {/*>*/}
              {/*  networkName*/}
              {/*</button>*/}
              <p className="info-text alert alert-secondary">
                nickNameResponse: <span id="nickNameResponse">{injectedCkbService.nicknameResponse}</span>
              </p>
              <p className="info-text alert alert-secondary">
                networkNameResponse: <span id="networkNameResponse">{injectedCkbService.networkNameResponse}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  const { injectedCkbService } = useStore();

  return (
    <div className="App">
      <div>{connectionSection(injectedCkbService)}</div>
      <hr />
      <div>
        <section>
          <div id={`ckb-request-form`}>
            <h4>ckb request </h4>
            <input className="form-control" type="text" placeholder="method" id={'ckbRequestMethodInput'} />
            <input className="form-control" type="text" placeholder="params" id={'ckbRequestParamsInput'} />
            <button
              className="btn btn-primary btn-lg btn-block mb-3"
              id={`ckbRequestButton`}
              onClick={() =>
                injectedCkbService.ckb_request(
                  document.getElementById('ckbRequestMethodInput').value,
                  document.getElementById('ckbRequestParamsInput').value,
                )
              }
              disabled={!injectedCkbService.enableStatus}
            >
              ckb request
            </button>
            <p className="info-text alert alert-secondary">
              ckb request response: <span id={'ckbRequestResponse'}>{injectedCkbService.ckbRequestResponse}</span>
            </p>
          </div>
          <hr />
          <hr />
          <hr />
          <div id={`wallet_fullOwnership_getLiveCells-form`}>
            <h4>wallet fullOwnership getLiveCells</h4>
            <input
              className="form-control"
              type="text"
              placeholder="payload"
              id={'walletFullOwnershipGetLiveCellsInput'}
            />
            <button
              className="btn btn-primary btn-lg btn-block mb-3"
              id={`walletFullOwnershipGetLiveCellsButton`}
              onClick={() =>
                injectedCkbService.wallet_fullOwnership_getLiveCells(
                  document.getElementById('walletFullOwnershipGetLiveCellsInput').value,
                )
              }
              disabled={!injectedCkbService.enableStatus}
            >
              get Live Cells
            </button>
            <p className="info-text alert alert-secondary">
              walletFullOwnershipGetLiveCellsResult:{' '}
              <span id={'walletFullOwnershipGetLiveCellsResponse'}>
                {injectedCkbService.fullOwnershipGetLiveCellsResponse}
              </span>
            </p>
          </div>
          <hr />
          <hr />
          <hr />
          <div id={`wallet_fullOwnership_getOffChainLocks-form`}>
            <h4>wallet_fullOwnership_getOffChainLocks</h4>
            <input
              className="form-control"
              type="text"
              placeholder="payload"
              id={'walletFullOwnershipGetOffChainLocksInput'}
            />
            <button
              className="btn btn-primary btn-lg btn-block mb-3"
              id={`walletFullOwnershipGetOffChainLocksButton`}
              onClick={() =>
                injectedCkbService.wallet_fullOwnership_getOffChainLocks(
                  document.getElementById('walletFullOwnershipGetOffChainLocksInput').value,
                )
              }
              disabled={!injectedCkbService.enableStatus}
            >
              Get OffChain Locks
            </button>
            <p className="info-text alert alert-secondary">
              walletFullOwnershipGetOffChainLocksResponse:{' '}
              <span id={'walletFullOwnershipGetOffChainLocksResponse'}>
                {injectedCkbService.fullOwnershipGetOffChainLocksResponse}
              </span>
            </p>
          </div>
          <hr />
          <hr />
          <hr />
          <div id={`wallet_fullOwnership_getOnChainLocks-form`}>
            <h4>wallet_fullOwnership_getOnChainLocks</h4>
            <input
              className="form-control"
              type="text"
              placeholder="payload"
              id={'walletFullOwnershipGetOnChainLocksInput'}
            />
            <button
              className="btn btn-primary btn-lg btn-block mb-3"
              id={`walletFullOwnershipGetOnChainLocksButton`}
              onClick={() =>
                injectedCkbService.wallet_fullOwnership_getOnChainLocks(
                  document.getElementById('walletFullOwnershipGetOnChainLocksInput').value,
                )
              }
              disabled={!injectedCkbService.enableStatus}
            >
              Get OnChain Locks
            </button>
            <p className="info-text alert alert-secondary">
              walletFullOwnershipGetOnChainLocksResponse:{' '}
              <span id={'walletFullOwnershipGetOnChainLocksResponse'}>
                {injectedCkbService.fullOwnershipGetOnChainLocksResponse}
              </span>
            </p>
          </div>
          <hr />
          <hr />
          <hr />
          <div id={`wallet_fullOwnership_signData-form`}>
            <h4>wallet_fullOwnership_signData</h4>
            <input className="form-control" type="text" placeholder="payload" id={'walletFullOwnershipSignDataInput'} />
            <button
              className="btn btn-primary btn-lg btn-block mb-3"
              id={`walletFullOwnershipSignDataButton`}
              onClick={() =>
                injectedCkbService.wallet_fullOwnership_signData(
                  document.getElementById('walletFullOwnershipSignDataInput').value,
                )
              }
              disabled={!injectedCkbService.enableStatus}
            >
              Sign Data
            </button>
            <p className="info-text alert alert-secondary">
              walletFullOwnershipSignDataResponse:{' '}
              <span id={'walletFullOwnershipSignDataResponse'}>
                {injectedCkbService.walletFullOwnershipSignDataResponse}
              </span>
            </p>
          </div>
          <hr />
          <hr />
          <hr />
          <div id={`wallet_fullOwnership_signTransaction-form`}>
            <h4>wallet_fullOwnership_signTransaction</h4>
            <input
              className="form-control"
              type="text"
              placeholder="payload"
              id={'walletFullOwnershipSignTransactionInput'}
            />
            <button
              className="btn btn-primary btn-lg btn-block mb-3"
              id={`walletFullOwnershipSignTransactionButton`}
              onClick={() =>
                injectedCkbService.wallet_fullOwnership_signData(
                  document.getElementById('walletFullOwnershipSignTransactionInput').value,
                )
              }
              disabled={!injectedCkbService.enableStatus}
            >
              Sign Transaction
            </button>
            <p className="info-text alert alert-secondary">
              walletFullOwnershipSignTransactionResponse:{' '}
              <span id={'walletFullOwnershipSignTransactionResponse'}>
                {injectedCkbService.walletFullOwnershipSignTransactionResponse}
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default observer(App);
