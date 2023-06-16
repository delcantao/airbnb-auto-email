# Dolce Gusto - Automatically Insert Codes

## About

Code snippet in JS (Node) to automatically insert Dolce Gusto bonus codes on the website. It uses Puppeteer.

### Prerequisites

It is necessary for the user to have Node.js installed on their machine to proceed with the following instructions.


```
npm install
```
or

```
npm i puppeteer-extra puppeteer-extra-plugin-stealth
```

Define the path to your Google Chrome browser and the file path containing the codes (one per line).

```
const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const filePath = 'D:\\repos\\codes_dolce_gusto.txt';
```

Furthermore, it is necessary to set the environment variables USER_DOLCE_GUSTO and PASS_DOLCE_GUSTO with the corresponding username and password respectively.

### Running

```
node index.js
```

Now all you have to do is wait until it finishes. You can go grab a cup of coffee.
