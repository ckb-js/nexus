/* eslint-disable */
import { observer } from 'mobx-react-lite';
import { useStore } from './ckb';

const FULL_OWNERSHIP = 'fullOwnership';
const RULE_BASED_OWNERSHIP = 'ruleBasedOwnership';

function connectionSection(injectedCkbService) {
  // todo add monit network change
  // {
  //     window.ckb.on('networkChanged',(cb)=>{
  //         injectedCkbService.networkNameResponse = cb.network;
  //     });
  // }
  return (
    <section>
      <div className="row d-flex justify-content-center">
        <div className="col-xl-4">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Basic Actions</h4>
              <p className="info-text alert  alert-secondary">
                nexus version: <span id="ckbVersion">{injectedCkbService.ckbVersion}</span>
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

function getOwnershipByType(injectedCkbService, type) {
  if (type === FULL_OWNERSHIP) {
    return injectedCkbService.ckbProvider.fullOwnership;
  }
  if (type === RULE_BASED_OWNERSHIP) {
    return injectedCkbService.ckbProvider.ruleBasedOwnership;
  }
}

function getLiveCell(injectedCkbService, ownershipService, ownershipType) {
  {
    // let rt = window.ckb.isEnabled()
    // console.log("rt:",rt)
  }
  return (
    <div id={`${ownershipType}-getLiveCell-form`}>
      <h4>get Live Cell</h4>
      <input className="form-control" type="text" placeholder="payload" id={`${ownershipType}-getLiveCellInput`} />
      <button
        className="btn btn-primary btn-lg btn-block mb-3"
        id={`${ownershipType}-getLiveCellButton`}
        onClick={() =>
          ownershipService.getLiveCells(
            getOwnershipByType(injectedCkbService, ownershipType),
            document.getElementById(`${ownershipType}-getLiveCellInput`).value,
          )
        }
        disabled={!injectedCkbService.enableStatus}
      >
        get Live Cell
      </button>
      <p className="info-text alert alert-secondary">
        getLiveCellResult:{' '}
        <span id={`${ownershipType}-getLiveCellResult`}>{ownershipService.getLiveCellsResponse}</span>
      </p>
    </div>
  );
}

function getUsedLocks(injectedCkbService, ownershipService, ownershipType) {
  return (
    <div id={`${ownershipType}-getUsedLocks-form`}>
      <h4>get Used Locks</h4>
      <input className="form-control" type="text" placeholder="payload" id={`${ownershipType}-getUsedLocksInput`} />
      <button
        className="btn btn-primary btn-lg btn-block mb-3"
        id={`${ownershipType}-getUsedLocksButton`}
        onClick={() =>
          ownershipService.getUnusedLocks(
            getOwnershipByType(injectedCkbService, ownershipType),
            document.getElementById(`${ownershipType}-getUsedLocksInput`).value,
          )
        }
        disabled={!injectedCkbService.enableStatus}
      >
        get Used Locks
      </button>
      <p className="info-text alert alert-secondary">
        getUsedLocksResult:{' '}
        <span id={`${ownershipType}-getUsedLocksResult`}>{ownershipService.getUsedLocksResponse}</span>
      </p>
    </div>
  );
}

function signTransaction(injectedCkbService, ownershipService, ownershipType) {
  return (
    <div id={`${ownershipType}-signTransaction-form`}>
      <h4>signTransaction</h4>
      <input className="form-control" type="text" placeholder="payload" id={`${ownershipType}-signTransactionInput`} />
      <button
        className="btn btn-primary btn-lg btn-block mb-3"
        id={`${ownershipType}-signTransactionButton`}
        onClick={() =>
          ownershipService.signTransaction(
            getOwnershipByType(injectedCkbService, ownershipType),
            document.getElementById(`${ownershipType}-signTransactionInput`).value,
          )
        }
        disabled={!injectedCkbService.enableStatus}
      >
        sign Transaction
      </button>
      <p className="info-text alert alert-secondary">
        signTransactionResult:{' '}
        <span id={`${ownershipType}-signTransactionResult`}>{ownershipService.signTransactionResponse}</span>
      </p>
    </div>
  );
}

function signData(injectedCkbService, ownershipService, ownershipType) {
  return (
    <div id={`${ownershipType}-signData-form`}>
      <h4>signData</h4>
      <input
        className="form-control"
        type="text"
        placeholder='{"data":"0x1234"}'
        id={`${ownershipType}-signDataInput`}
      />
      <button
        className="btn btn-primary btn-lg btn-block mb-3"
        id={`${ownershipType}-signDataButton`}
        onClick={() =>
          ownershipService.signData(
            getOwnershipByType(injectedCkbService, ownershipType),
            document.getElementById(`${ownershipType}-signDataInput`).value,
          )
        }
        disabled={!injectedCkbService.enableStatus}
      >
        sign Data
      </button>
      <p className="info-text alert alert-secondary">
        signDataInputResult: <span id={`${ownershipType}-signDataResult`}>{ownershipService.signDataResponse}</span>
      </p>
    </div>
  );
}

function getUnusedLocks(injectedCkbService, ownershipService, ownershipType) {
  return (
    <div id={`${ownershipType}-getUnusedLocks-form`}>
      <h4>get Unused Locks</h4>
      <label htmlFor={`${ownershipType}-getUnusedLocksInput`}>change:</label>
      <br />
      <input className="form-control" type="text" placeholder="true" id={`${ownershipType}-getUnusedLocksInput`} />

      <button
        className="btn btn-primary btn-lg btn-block mb-3"
        id={`${ownershipType}-getUnusedLocksButton`}
        onClick={() =>
          ownershipService.getUnusedLocks(
            getOwnershipByType(injectedCkbService, ownershipType),
            document.getElementById(`${ownershipType}-getUnusedLocksInput`).value,
          )
        }
        disabled={!injectedCkbService.enableStatus}
      >
        get Unused Locks Button
      </button>
      <p className="info-text alert alert-secondary">
        getLiveCellsResponse:{' '}
        <span id={`${ownershipType}-getLiveCellsResponse`}>{ownershipType.getLiveCellsResponse}</span>
      </p>
    </div>
  );
}

function getFullOwnership(ownershipService, injectedCkbService) {
  return (
    <div className="d-flex align-items-stretch">
      <div className="card full-width">
        <div className="card-body">
          <h3>Full Ownership</h3>
          <hr />
          {getLiveCell(injectedCkbService, ownershipService, FULL_OWNERSHIP)}
          <hr />
          {getUnusedLocks(injectedCkbService, ownershipService, FULL_OWNERSHIP)}
          <hr />
          {signTransaction(injectedCkbService, ownershipService, FULL_OWNERSHIP)}
          <hr />
          {signData(injectedCkbService, ownershipService, FULL_OWNERSHIP)}
        </div>
      </div>
    </div>
  );
}

function getRuleBasedOwnership(ownershipService, injectedCkbService) {
  return (
    <div className=" col-lg d-flex align-items-stretch">
      <div className="card full-width">
        <div className="card-body">
          <h4 className="card-title">Rule Based Ownership</h4>
          <hr />
          {getLiveCell(injectedCkbService, ownershipService, RULE_BASED_OWNERSHIP)}
          <hr />
          {getUnusedLocks(injectedCkbService, ownershipService, RULE_BASED_OWNERSHIP)}
          <hr />
          {signTransaction(injectedCkbService, ownershipService, RULE_BASED_OWNERSHIP)}
          <hr />
          {signData(injectedCkbService, ownershipService, RULE_BASED_OWNERSHIP)}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { fullOwnership, ruleBasedOwnership, injectedCkbService } = useStore();

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
              wallet full Ownership getLive Cells
            </button>
            <p className="info-text alert alert-secondary">
              walletFullOwnershipGetLiveCellsResult:{' '}
              <span id={'walletFullOwnershipGetLiveCellsResponse'}>
                {injectedCkbService.fullOwnershipGetLiveCellsResponse}
              </span>
            </p>
          </div>

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
              walletFullOwnershipGetOffChainLocksButton
            </button>
            <p className="info-text alert alert-secondary">
              walletFullOwnershipGetOffChainLocksResponse:{' '}
              <span id={'walletFullOwnershipGetOffChainLocksResponse'}>
                {injectedCkbService.fullOwnershipGetOffChainLocksResponse}
              </span>
            </p>
          </div>

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
              walletFullOwnershipGetOnChainLocksButton
            </button>
            <p className="info-text alert alert-secondary">
              walletFullOwnershipGetOnChainLocksResponse:{' '}
              <span id={'walletFullOwnershipGetOnChainLocksResponse'}>
                {injectedCkbService.fullOwnershipGetOnChainLocksResponse}
              </span>
            </p>
          </div>

          <div id={`wallet_fullOwnership_signData-form`}>
            <h4>wallet_fullOwnership_getOnChainLocks</h4>
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
              walletFullOwnershipSignDataButton
            </button>
            <p className="info-text alert alert-secondary">
              walletFullOwnershipSignDataResponse:{' '}
              <span id={'walletFullOwnershipSignDataResponse'}>
                {injectedCkbService.walletFullOwnershipSignDataResponse}
              </span>
            </p>
          </div>

          <div id={`wallet_fullOwnership_signTransaction-form`}>
            <h4>wallet_fullOwnership_getOnChainLocks</h4>
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
              walletFullOwnershipSignDataButton
            </button>
            <p className="info-text alert alert-secondary">
              walletFullOwnershipSignTransactionResponse:{' '}
              <span id={'walletFullOwnershipSignTransactionResponse'}>
                {injectedCkbService.walletFullOwnershipSignTransactionResponse}
              </span>
            </p>
          </div>
        </section>

        <h1>Discarded</h1>
        <hr />
        <section>
          <div className="row">
            {getFullOwnership(fullOwnership, injectedCkbService)}
            {getRuleBasedOwnership(ruleBasedOwnership, injectedCkbService)}
          </div>
        </section>
      </div>
    </div>
  );
}

export default observer(App);
