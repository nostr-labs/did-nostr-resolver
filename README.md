# DID-Nostr Resolver

![DID-Nostr Resolver](https://img.shields.io/badge/DID-Nostr%20Resolver-6366f1)
![License](https://img.shields.io/badge/license-MIT-green)
![Offline First](https://img.shields.io/badge/offline--first-✨-brightgreen)
![W3C Compliant](https://img.shields.io/badge/W3C%20compliant-Multikey-blue)

A powerful, **offline-first** resolver for Decentralized Identifiers (DIDs) on the Nostr network, bridging Nostr identities with the W3C DID ecosystem using standardized **Multikey** verification methods.

## ✨ Key Features

### 🚀 **Offline-First Resolution**
- **Instant resolution** from public key alone - **no network required**
- **High reliability** - works when relays are down or unreachable
- **Perfect for mobile/desktop apps** and embedded systems
- **Zero latency** - pure computational resolution

### 📊 **W3C Standards Compliant**
- **Multikey verification method** (latest W3C standard)
- **Multicodec/multibase encoding** for secp256k1 keys
- **Data Integrity compatible** for future verifiable credentials
- **Spec-compliant contexts** and document structure

### 🔧 **Dual Resolution Modes**
- **Minimal Mode**: Offline-first, instant resolution
- **Enhanced Mode**: Optional relay queries for service endpoints
- **Backward compatible** with existing implementations
- **Flexible API** - choose the mode that fits your needs

### 🎯 **Developer-Friendly**
- **Simple API** - works with hex pubkeys or npub format  
- **Comprehensive examples** and documentation
- **CLI tool** for command-line usage
- **Browser and Node.js** compatible

## 📋 About DID-Nostr Method

The Nostr DID method (`did:nostr`) enables decentralized identifiers on the Nostr network, providing a standardized way to reference Nostr public keys in the W3C DID ecosystem.

### DID Format

Nostr DIDs follow this format:

```
did:nostr:<64-character-lowercase-public-key>
```

### Example DID Documents

#### Minimal DID Document (Offline Resolution)
Generated instantly from public key alone, **no network required**:

```json
{
  "@context": ["https://w3id.org/did", "https://w3id.org/nostr/context"],
  "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2",
  "verificationMethod": [
    {
      "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2#key1",
      "type": "Multikey",
      "controller": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2",
      "publicKeyMultibase": "fe70102124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2"
    }
  ],
  "authentication": ["#key1"],
  "assertionMethod": ["#key1"]
}
```

#### Enhanced DID Document (With Service Endpoints)
Includes optional relay and service information from network queries:

```json
{
  "@context": ["https://w3id.org/did", "https://w3id.org/nostr/context"],
  "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2",
  "verificationMethod": [
    {
      "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2#key1",
      "type": "Multikey",
      "controller": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2",
      "publicKeyMultibase": "fe70102124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2"
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

## 🚀 Quick Start

### Offline-First Resolution (Recommended)
```javascript
const didNostrResolver = require('did-nostr-resolver');

// Instant resolution - no network required!
const pubkey = '124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2';
const did = `did:nostr:${pubkey}`;

// Option 1: Direct minimal resolution
const didDoc = didNostrResolver.resolveDidNostrMinimal(did);
console.log(didDoc);

// Option 2: Using enhanced resolver in minimal mode  
const didDoc2 = await didNostrResolver.resolveDidNostr(did, { minimal: true });
console.log(didDoc2); // Same result as above
```

### Enhanced Resolution (Optional Network Queries)
```javascript
// Get DID document with optional service endpoints
const enhancedDoc = await didNostrResolver.resolveDidNostr(did, {
  // These options are all optional:
  verbose: true,           // Show detailed logs
  minimal: false,          // Enable network queries (default)
  domains: ['example.com'] // Specific domains for HTTP resolution
});
console.log(enhancedDoc);
```

## 🔍 Core Capabilities

- **🚀 Offline-First** - Generate complete DID documents without network access
- **📊 W3C Multikey** - Uses standardized verification method format with multicodec/multibase
- **🔧 Dual Modes** - Choose between instant offline or enhanced network resolution
- **🎯 Nostr Native** - Full compatibility with Nostr ecosystem (npub support, relay integration)
- **⚡ Zero Latency** - Deterministic resolution from public key alone
- **🛡️ High Reliability** - Works when relays are unreachable or offline
- **📱 Universal** - Browser and Node.js compatible with simple API

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
   npm link  # Optional, to use the CLI globally
   ```

2. **Create a DID**:

   ```bash
   # 🚀 NEW: Offline-first resolution (RECOMMENDED - instant, no network)
   did-nostr-resolver create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --minimal

   # Basic usage with enhanced resolution (includes relay queries)
   did-nostr-resolver create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245

   # Verbose mode (shows detailed output about the process)
   did-nostr-resolver create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 -v

   # With specific relays (disables automatic relay fetching)
   did-nostr-resolver create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --relays=wss://relay.damus.io,wss://nos.lol

   # Include website and storage endpoints from Nostr profile
   did-nostr-resolver create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --include-profile

   # Save output to file
   did-nostr-resolver create 32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --output=mydid.json
   ```

3. **Resolve a DID**:

   ```bash
   # 🚀 NEW: Offline-first resolution (RECOMMENDED - instant, works offline)
   did-nostr-resolver resolve did:nostr:32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --minimal

   # Enhanced resolution (includes optional relay queries)
   did-nostr-resolver resolve did:nostr:32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245

   # Verbose mode
   did-nostr-resolver resolve did:nostr:32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 -v

   # Include website and storage endpoints from Nostr profile
   did-nostr-resolver resolve did:nostr:32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --include-profile

   # Use HTTP resolution with specific domains
   did-nostr-resolver resolve did:nostr:32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245 --domains=example.com,nostr.com
   ```

4. **Get help**:

   ```bash
   did-nostr-resolver help
   ```

5. **Example Output (New Multikey Format)**:

   ```json
   {
     "@context": [
       "https://w3id.org/did",
       "https://w3id.org/nostr/context"
     ],
     "id": "did:nostr:f0af407bd5a2e44c22021f9d89c8a8c7239cc723e3f3bd46d749e6f92d860065",
     "verificationMethod": [
       {
         "id": "did:nostr:f0af407bd5a2e44c22021f9d89c8a8c7239cc723e3f3bd46d749e6f92d860065#key1",
         "type": "Multikey",
         "controller": "did:nostr:f0af407bd5a2e44c22021f9d89c8a8c7239cc723e3f3bd46d749e6f92d860065",
         "publicKeyMultibase": "fe7010f0af407bd5a2e44c22021f9d89c8a8c7239cc723e3f3bd46d749e6f92d860065"
       }
     ],
     "authentication": ["#key1"],
     "assertionMethod": ["#key1"],
     "service": [
       {
         "id": "did:nostr:f0af407bd5a2e44c22021f9d89c8a8c7239cc723e3f3bd46d749e6f92d860065#relay1",
         "type": "Relay",
         "serviceEndpoint": "wss://relay.damus.io"
       },
       {
         "id": "did:nostr:f0af407bd5a2e44c22021f9d89c8a8c7239cc723e3f3bd46d749e6f92d860065#storage1",
         "type": "Storage",
         "serviceEndpoint": "https://nosdav.net/f0af407bd5a2e44c22021f9d89c8a8c7239cc723e3f3bd46d749e6f92d860065/"
       }
     ]
   }
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
   - First check for profile at `.well-known/did/nostr/<pubkey>.json` via HTTP
   - Fall back to querying Nostr relays if HTTP resolution fails
   - Extract website URLs and storage endpoints to include in the DID document

4. **HTTP Resolution**:
   - Domains can serve profile information at `.well-known/did/nostr/<pubkey>.json`
   - HTTP resolution is attempted first before querying Nostr relays
   - Specify domains explicitly or let the resolver auto-detect them from relays or website
   - Enable fast, direct profile retrieval without WebSocket connections

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
