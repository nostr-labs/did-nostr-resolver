# did-nostr-resolver

A JavaScript library and CLI tool for working with Nostr Decentralized Identifiers (DIDs).

This library implements the unofficial draft specification for the `did:nostr` method, enabling the creation and resolution of DIDs based on Nostr public keys.

## Installation

```bash
npm install did-nostr-resolver
```

## Usage

### As a Library

```javascript
const {
  createDidNostr,
  createDidNostrDocument,
  resolveDidNostr
} = require('did-nostr-resolver')

// Create a DID from a Nostr public key
const pubkey =
  '124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2'
const did = createDidNostr(pubkey)
console.log(did)
// Output: did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2

// Create a DID document with relays
const didDocument = createDidNostrDocument(pubkey, {
  relays: ['wss://relay.example.org/']
})
console.log(JSON.stringify(didDocument, null, 2))

// Resolve a DID to a DID document
const resolvedDocument = resolveDidNostr(
  'did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2'
)
console.log(JSON.stringify(resolvedDocument, null, 2))
```

### As a CLI Tool

After installation, you can use the CLI tool to create and resolve DIDs:

```bash
# Create a DID document from a public key
npx did-nostr-resolver create 124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2

# Create a DID document with relay information
npx did-nostr-resolver create 124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2 wss://relay.example.org/

# Resolve a DID to its DID document
npx did-nostr-resolver resolve did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2
```

The output will be displayed in the console and also saved to a file named after the DID (with colons replaced by hyphens).

### Web Interface

The repository includes an `index.html` file that provides a web interface for working with DID-Nostr identifiers. To use it:

1. Open the `index.html` file in a web browser
2. Enter a Nostr public key or DID to create or resolve a DID document
3. Optionally add relay information
4. The resulting DID document will be displayed on the page

## DID Format

Nostr DIDs follow this format:

```
did:nostr:<64-character-lowercase-public-key>
```

Example:

```
did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2
```

## Example DID Document

When a Nostr DID is resolved, it produces a DID Document like this:

```json
{
  "@context": ["https://w3id.org/did/v1", "https://w3id.org/nostr/v1"],
  "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2",
  "publicKey": [
    {
      "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2#key1",
      "controller": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2",
      "type": "SchnorrVerification2023",
      "publicKeyHex": "124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2"
    }
  ],
  "authentication": [
    "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2#key1"
  ],
  "assertionMethod": [
    "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2#key1"
  ],
  "service": [
    {
      "id": "did:nostr:124c0fa99407182ece5a24fad9b7f6674902fc422843d3128d38a0afbee0fdd2#relay1",
      "type": "NostrRelay",
      "serviceEndpoint": "wss://relay.example.org/"
    }
  ]
}
```

## Key Features

- **Schnorr Signatures**: Uses the same cryptographic signature scheme as Nostr
- **Relay Declaration**: Service fields allow declaring associated Nostr relays
- **Simple Creation**: Generate a key pair and encode the public key as a 64-character string
- **Deterministic Resolution**: DID documents can be deterministically generated from the public key

## Functions

The library provides the following functions:

- `isValidNostrPubkey(pubkey)`: Validates if a string is a valid 64-character hex Nostr public key
- `npubToHex(npub)`: Placeholder for converting an npub to a hex public key (requires external Bech32 library)
- `createDidNostr(pubkey)`: Creates a DID-Nostr identifier from a Nostr public key
- `createDidNostrDocument(pubkey, options)`: Creates a complete DID Document for a Nostr public key
- `resolveDidNostr(did, options)`: Resolves a DID-Nostr identifier to its DID Document

## Relationship with Nostr npubs

In the Nostr ecosystem, public keys are often displayed as "npubs" (e.g., `npub1...`), which are Bech32 encoded versions of the raw public keys for human-friendly display. It's important to note:

- Nostr DIDs use the raw 64-character hexadecimal public key, not the npub format
- npubs are for display purposes only and improve readability in user interfaces

## License

MIT License

## Credits

This library implements the unofficial draft specification for the `did:nostr` method being developed within the W3C Nostr Community Group. The specification is inspired by [did-nostr](https://github.com/melvincarvalho/did-nostr).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
