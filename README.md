# Random Number Image Generator

A crude tool for generating random number images and metadata for the purpose of creating NFTs.

Can generate an image with a number from 0 to 9999 with the current settings.

The number images can have 5 different background colors.

10.000 num \* 5 bg = 50.000 combinations

4 digit number ~ 0,9 probability

3 digit number ~ 0,1 probability

2 digit number ~ 0,01 probability

1 digit number 0,001 probability

## Usage

```
Change on index.js
idx = number of images to generate
max = max number to generate
```

```
git clone <this-repo>
npm install
npm run randos
```
