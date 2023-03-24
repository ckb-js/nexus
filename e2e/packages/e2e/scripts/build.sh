set -x
pwd
cd ../../../
pwd
npm install
npm run build
npm run build -w=@nexus-wallet/extension-chrome
rm -rf e2e/packages/e2e/build
cp -r packages/extension-chrome/build e2e/packages/e2e/

