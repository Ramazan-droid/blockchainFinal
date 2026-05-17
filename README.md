### Code Generation & Local Compilation

Compile your GraphQL schema rules and generate native AssemblyScript types from your smart contract ABIs.

```bash
# Navigate to your subgraph workspace directory
cd subgraph

# Generate AssemblyScript types
npm run codegen

# Build and compile your WebAssembly (.wasm) binary mappings
npm run build

```

---

### Authentication with Subgraph Studio

Authenticate your local CLI environment with your developer profile token to grant deployment permissions.

```bash
npx graph auth --studio <deployment-key>

```

---

### Deploying to the Indexing Network

Push your compiled schema configurations and WASM code binaries directly to the Graph Studio infrastructure.

```bash
npx graph deploy --studio <slug-name>

```
