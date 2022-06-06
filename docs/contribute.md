# Contribute to frodo
Any direct commits to the repository are not allowed. Pull requests (PR) are most welcome. Please fork this repo and develop and test in that fork. Once you feel ready, please create a PR. For any major changes, please open an [issue](https://github.com/rockcarver/frodo/issues) first to discuss what and why you'd like to change.

## Developing
### Setting up your build environment
Rather than detailing the process of contributing to a github open-source project here, here are a couple of excellent resources for getting started. These are great reads not only for someone new to contributing to a github project, but even regular contributors may fine some great tidbits of information.

- [https://github.com/firstcontributions/first-contributions](https://github.com/firstcontributions/first-contributions)
Also take a look at [Additional material](https://github.com/firstcontributions/first-contributions/blob/master/additional-material/git_workflow_scenarios/additional-material.md) towards the end, as there are some good tips on that page.

OR

- [https://www.dataschool.io/how-to-contribute-on-github/](https://www.dataschool.io/how-to-contribute-on-github/)

### Prerequisites
- Node.js 18 (used by developers) or newer
- npm (included with Node.js)
- A GUI editor is highly recommended. The current developers use [VSCode](https://code.visualstudio.com/), but you are welcome to others, like [Atom](https://atom.io/) or [Sublime](https://www.sublimetext.com/) too. The repository contains configuration files for VSCode's [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [prettier](https://prettier.io/) add-ons, which will automatically lint the code and apply coding styles when using VSCode. The same files may work for other editors with similar add-ons, but this has not been tested.

### Build
To build locally we need to do a couple of extra steps due to a limitation with the `pkg` module we're using to distribute binaries. `pkg` [doesn't support ES6](https://github.com/vercel/pkg/issues/1291) modules as of yet, so we have to transpile to commonJS then build.

There should be a `dist` folder when you cloned the repo from Github, the binaries will get pushed there. We're using a `gulp` script to transpile ES6 module to commonJS and then `pkg` can create the binary for the respective OS. For Mac OS you'll have to sign the binary

#### For windows and Linux

```console
cd $HOME/frodo
npm install
npm install -g pkg gulp
gulp
cd ./dist
npm i
#For Windows
pkg -C Gzip -t node16-win-x64 --out-path bin/win .
#For Linux
pkg -C Gzip -t node16-linux-x64 --out-path bin/linux .
```

#### For MacOS

For MacOS we need to sign the binaries with an Apple Developer Cert.

```console
# create variables
CERTIFICATE_PATH=<YOUR_CERTIFICATE_PATH>
INTERMEDIATE_CERTIFICATE_PATH=<YOUR_INTERMEDIATE_CERTIFICATE_PATH>
KEYCHAIN_PATH=<YOUR_TEMP_KEYCHAIN_PATH>
KEYCHAIN_PASSWORD=<KEY_CHAIN_PASSWORD>
DEVELOPMENT_CERTIFICATE_PASSPHRASE=<YOUR_CERT_PASSPHRASE>

#create temp keychain
security create-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH
security set-keychain-settings -lut 21600 $KEYCHAIN_PATH
security unlock-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH

#import certs to keychain
security import $CERTIFICATE_PATH -P "$DEVELOPMENT_CERTIFICATE_PASSPHRASE" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH
security import $INTERMEDIATE_CERTIFICATE_PATH -P "$DEVELOPMENT_CERTIFICATE_PASSPHRASE" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH
security list-keychain -d user -s $KEYCHAIN_PATH

# import certificate to keychain
security import $CERTIFICATE_PATH -P "$DEVELOPMENT_CERTIFICATE_PASSPHRASE" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH
security import $INTERMEDIATE_CERTIFICATE_PATH -P "$DEVELOPMENT_CERTIFICATE_PASSPHRASE" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH
security list-keychain -d user -s $KEYCHAIN_PATH

cd $HOME/frodo
npm install
npm install -g pkg gulp
gulp

cd ./dist
npm i
pkg -C Gzip -t node16-macos-x64 --out-path bin/macos .

cd ./dist/bin/macos
codesign -f -s 'DEV_ID' --timestamp --deep frodo
```

This will build `frodo` in each local directory respective to the OS target you chose

```console
./dist/bin/linux/frodo
./dist/bin/macos/frodo
./dist/bin/win/frodo
```

#### Run

`frodo` is self contained, statically linked, so no dependencies should be needed. It can be run as:

```console
$HOME/frodo/frodo # or the platform equivalent binary
```

We recommend sourcing, or adding it to the path if you're on windows, to make it easier to call from your terminal without switching directories
