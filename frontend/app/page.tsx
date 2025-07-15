import WalletConnection from './components/WalletConnection';

export default function Home() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Aptos Wallet Integration Demo</h1>
        <p>Connect your wallet and try sample transactions</p>
      </header>
      
      <main className="app-main">
        <WalletConnection />
      </main>
      
      <footer className="app-footer">
        <p>Built with Next.js App Router + TypeScript + Aptos</p>
        <p>
          <a 
            href="https://explorer.aptoslabs.com/?network=testnet" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Aptos Testnet Explorer
          </a>
        </p>
      </footer>
    </div>
  );
}