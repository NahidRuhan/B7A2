step-1: npm init -y
step-2: tsc --init
step-3: npm install -D @types/node
step-4: {"rootDir": "./src", "outDir": "./dist", "module": "esnext", "moduleResolution": "bundler", "types": ["node"]}, comment "jsx"
step-5: npm i -D tsx
step-6: mkdir src --> index.ts
step-7: "scripts": {"dev": "tsx watch ./src/[filename].ts"}, "type": "module",
STEP-8: npm i express dotenv pg @neondatabase/serverless