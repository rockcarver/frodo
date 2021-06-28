Very basic README for now...

This is the ForgeROckDO (frodo) cli executable. This is a statically linked binary which can be cross compiled for multiple platforms (linux, MacOS, Windows etc.) and architectures (386 (32-bit x86), amd64 (64-bit x86_64), arm5, arm7 etc.)

# Developing

## Prerequisites
- Install go
- Set GOPATH in your profile (default is ~/go)
- Add $GOPATH/bin to your PATH

## Process
- Create directories
```
cd $GOPATH
mkdir -p src/github.com/rockcarver
```
- Clone this repo
```
cd $GOPATH/src/github.com/rockcarver
git clone git@github.com:rockcarver/frodo.git
```
- Clone the frodolibs repo
```
cd $GOPATH/src/github.com/rockcarver
git clone git@github.com:rockcarver/frodolibs.git
```

## Build
```
cd $GOPATH/src/github.com/rockcarver/frodo
go build
```
This will build `frodo` in local directory. One can also
```
cd $GOPATH/src/github.com/rockcarver/frodo
go install
```
which will build and move the `frodo` binary to $GOPATH/bin


## Cross platform
### Building on linux

To build for MacOS
```
cd $GOPATH/src/github.com/rockcarver/frodo
GOOS=darwin GOARCH=amd64 go install
```
To build for Windows
```
GOOS=windows GOARCH=amd64 go install
```

### Building on MacOS
To build for linux
```
cd $GOPATH/src/github.com/rockcarver/frodo
GOOS=linux GOARCH=amd64 go install
```
To build for Windows
```
GOOS=windows GOARCH=amd64 go install
```

# Run
`frodo` is self contained, statically linked, so no dependencies should be needed. It can be run as:
```
$GOPATH/frodo
```
or
```
./frodo
```

