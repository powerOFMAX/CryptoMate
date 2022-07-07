

- For the front-end I used ViteJS https://vitejs.dev/
- Tailwind CSS

Steps to run it locally:
- You'll need two test wallets on the network of goerli. You can use Metamask.
- You'll need a dev API Key for Giphy, you can copy the .env-example make new file called .env and replace the content with your API Key.
- If you want to change or deploy your own smart contract you have to modify `hardhat.cong.js` file and point it to your own private key of your wallet. Also if you decide to make a change in the contract you will need to update the `contractAddress` constant in the `contants.ts` file.