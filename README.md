# Discord Module
Discord module queries stackoverflow questions and makes Discord Embed Message.

## Requirements

- [Node.js](https://nodejs.org)
- [A Discord Bot](https://discord.com/developers/applications)

## Installation

Use Yarn to add the Package

```bash
yarn add @mahammadv/stackoverflow_search

```

or npm

```bash
npm i @mahammadv/stackoverflow_search
```
## Usage

```javascript
const stacksearch = require('@mahammadv/stackoverflow_search');

module.exports = {
    name: 'message',
    async execute(message) {
       const example_question = message.content;
       
       const embed = await stacksearch.search(example_question);
  }
}
```
