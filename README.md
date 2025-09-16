# Next.js + Chakra UI Starter

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), enhanced with [Chakra UI](https://chakra-ui.com) for accessible and flexible component styling.

## 🛠️ Tech Stack

- [Next.js App Router](https://nextjs.org/docs/app)
- [Chakra UI](https://chakra-ui.com)
- [TypeScript](https://www.typescriptlang.org/)

## ⚙️ Environment Setup

Before running the project, you need to create a `.env.local` file in the root directory and define the following:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This environment variable is used to configure the backend API URL.

> 🔁 If you pull new code and see changes in `package.json`, always re-run `npm install` (or your package manager of choice) to ensure dependencies are up to date.

## 🚀 Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser to see the app running.

You can start editing the homepage by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family from Vercel.

## 🧼 **ESLint** for Code Integrity

This project uses **ESLint Flat Config** (`eslint.config.mjs`) to ensure consistent code style.

#### Use ESLint & Prettier in VS Code (Recommended)

1. Install the ESLint & Prettier extension from the VS Code Marketplace.
2. Open the project in workspace mode:
   - Go to the menu bar: `File` > `Open Workspace from file`
   - Select the `uniconnected2-frontend.code-workspace` file located in the project root
   - Once opened, the VS Code window title will be `uniconnected2-frontend (Workspace)`
3. With this setup:
   - Linting errors and warnings will appear in real-time as you type
   - Formatting issues (e.g., indentation, quotes, trailing spaces) will be auto-fixed on save

#### Use ESLint & Prettier in CLI (Not Recommended)

```bash
npm run lint
npm run lint:fix
npm run format
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Chakra UI Docs](https://chakra-ui.com/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)

## 🤝 Contributing

We follow the [Gitflow branching strategy](https://medium.com/novai-devops-101/understanding-gitflow-a-simple-guide-to-git-branching-strategy-4f079c12edb9).

### Allowed Branch Names

- `feature/*` – for new features (branch off `develop`)
- `bugfix/*` – for bug fixes (branch off `develop`)
- `hotfix/*` – for urgent fixes discovered in production (branch off `master`)
- `release/*` – for preparing production releases (branch off `master`)

### Rules

- **Never push directly** to `master` or `develop`.
- Always open a **Pull Request (PR)**.
- A reviewer must approve and merge your PR.
