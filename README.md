# PLUM TESTNET TX BOT

PLUM TESTNET TX bot for adding more tx on chain

## BOT FEATURE

- Auto Claim Faucet (if faucet not received for long time, it mean faucet limit reached)
- Auto Check In
- Auto Swap ?? (coming soon)

## PREREQUISITE

- Git
- Node JS > v22

## SETUP

- run `git clone https://github.com/Widiskel/plum-testnet-bot.git`
- run `cd plum-testnet-bot`
- run `npm install`
- run `cp account_tmp.js account.js`
- fill up account.js `nano account.js` fill with your account Private Key or Seed Phrase

## CONFIGURATION

im adding config file for you to configure, open `src config/config.js` and adjust config. Here some configurable variables.

```js
maxErrorCount = 3; //max error retry
```

to configure destination address list, open `src config/address_list.js` adjust the list with yours. the bot will pick random destination address from that list to send token or it will send to its own wallet address.

## HOW TO UPDATE

to update just run `git pull` or if it failed because of unstaged commit, just run `git stash` and then `git pull`. after that do `npm install` or `npm update`.

## CONTRIBUTE

Feel free to fork and contribute adding more feature thanks.

## SUPPORT

want to support me for creating another bot ?
buy me a coffee on

EVM : `0x0fd08d2d42ff086bf8c6d057d02d802bf217559a`

SOLANA : `3tE3Hs7P2wuRyVxyMD7JSf8JTAmEekdNsQWqAnayE1CN`
