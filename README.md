# DID-Nostr Resolver

![DID-Nostr Resolver](https://img.shields.io/badge/DID-Nostr%20Resolver-6366f1)
![License](https://img.shields.io/badge/license-MIT-green)

A powerful web-based tool to create and resolve Decentralized Identifiers (DIDs) on the Nostr network, bridging the gap between Nostr identities and the W3C DID ecosystem.

## 🚀 Features

- **Create DIDs** from Nostr public keys with simple, user-friendly interface
- **Resolve DID Documents** from existing Nostr DIDs
- **Fetch Relays** automatically from Nostr metadata (kind 10002 events)
- **Support for npub format** for easy integration with Nostr ecosystem
- **Include profile information** like website and storage from Nostr profiles
- **Elegant UI/UX** with responsive design and animations
- **Zero server dependencies** - runs entirely in the browser

## 📋 About DID-Nostr Method

The Nostr DID method (`did:nostr`) enables decentralized identifiers on the Nostr network, providing a standardized way to reference Nostr public keys in the W3C DID ecosystem.

### DID Format

Nostr DIDs follow this format:

```
did:nostr:<64-character-lowercase-public-key>
```

### Example DID Document

```json
{
  "@context": ["https://w3id.org/did", "https://w3id.org/nostr/context"],
  "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2",
  "verificationMethod": [
    {
      "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2#key1",
      "controller": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2",
      "type": "SchnorrVerification2023"
    }
  ],
  "authentication": ["#key1"],
  "assertionMethod": ["#key1"],
  "service": [
    {
      "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2#relay1",
      "type": "Relay",
      "serviceEndpoint": "wss://relay.example.org"
    },
    {
      "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2#website",
      "type": ["Website", "LinkedDomains"],
      "serviceEndpoint": "https://example.com"
    }
  ]
}
```

## 🔍 Key Features

- **Schnorr Signatures** - Uses the same cryptographic signature scheme as Nostr for maximum compatibility
- **Relay Declaration** - Service fields allow declaring associated Nostr relays for discovery
- **Simple Creation** - Generate a key pair and encode the public key as a 64-character string
- **Deterministic Resolution** - DID documents can be deterministically generated from the public key
- **Profile Integration** - Include website and storage information from Nostr profiles

## 🛠️ Installation and Usage

### Web Interface

The DID-Nostr Resolver is a fully client-side application with no backend dependencies. You can:

1. **Clone and run locally**:

   ```bash
   git clone https://github.com/nostr-labs/did-nostr-resolver.git
   cd did-nostr-resolver
   # Serve with any static file server
   npx serve
   ```

2. **Host on any static file hosting**:
   The entire application consists of a single HTML file with embedded JavaScript, making it suitable for deployment on GitHub Pages, Netlify, Vercel, or any static hosting provider.

### Command-Line Interface

The DID-Nostr Resolver also includes a command-line interface (CLI) for creating and resolving DIDs:

1. **Install the CLI**:

   ```bash
   git clone https://github.com/nostr-labs/did-nostr-resolver.git
   cd did-nostr-resolver
   npm install
   chmod +x bin/cli.js
   ```

2. **Create a DID**:

   ```bash
   # Basic usage
   bin/cli.js create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245

   # With specific relays
   bin/cli.js create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --relays=wss://relay.damus.io,wss://nos.lol

   # Include website and storage from Nostr profile
   bin/cli.js create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --include-profile

   # Save output to file
   bin/cli.js create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --output=mydid.json
   ```

3. **Resolve a DID**:

   ```bash
   # Basic usage
   bin/cli.js resolve did:nostr:32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245

   # Include website and storage from Nostr profile
   bin/cli.js resolve did:nostr:32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --include-profile
   ```

4. **Get help**:

   ```bash
   bin/cli.js help
   ```

## 🧩 How It Works

1. **Creating DIDs**:

   - Enter your Nostr public key (64-character hex)
   - Optionally add Nostr relays or fetch them automatically from the network
   - Generate a W3C-compliant DID document that maps your identity to the Nostr ecosystem

2. **Resolving DIDs**:

   - Enter a DID in the format `did:nostr:<pubkey>`
   - Optionally specify relays for discovery
   - View the resolved DID document with verification methods and service endpoints

3. **Fetching Profile Information**:
   - For existing Nostr users, automatically fetch their profile information
   - Extract website URLs and storage endpoints to include in the DID document

## 🔐 Security and Privacy

- All processing happens client-side in the browser
- No keys or sensitive data ever leave your device
- Zero network requests except to fetch relay lists and profiles (when requested)
- The tool never requests or stores private keys

## 🧪 Technical Details

- Built with Preact for lightweight DOM operations
- Uses WebSocket for Nostr protocol interactions
- CLI tool compatible with both Node.js and browser environments
- Follows W3C DID specifications for document structure

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Open issues for bugs or feature requests
- Submit pull requests for improvements
- Help expand documentation or examples

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Contact

For questions or feedback about DID-Nostr Resolver, join the conversation on Nostr or open an issue in this repository.

---

Made with ❤️ for the Nostr and DID communities
