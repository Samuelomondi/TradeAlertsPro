# TradeAlert

TradeAlert is a web application designed to assist forex traders by generating trade signals using a combination of technical indicators and generative AI. It provides a dashboard with tools for signal generation, risk management, and market information, and integrates with Telegram to send real-time signal notifications.

## Features

- **AI-Powered Signal Generation**: Input technical indicator values (EMA, RSI, MACD, etc.) to have a GenAI model analyze the data and generate a comprehensive trade signal, including entry, stop loss, and take profit levels.
- **Telegram Notifications**: Automatically sends generated trade signals to a designated Telegram chat, allowing you to receive trade ideas on the go.
- **Trade History**: Keeps a running log of all generated signals, allowing you to review past performance and analysis.
- **Risk & Lot Size Calculator**: A handy tool to calculate the appropriate position size for a trade based on your account balance, risk percentage, and stop loss distance.
- **Market Hours Tracker**: A live dashboard showing the open/closed status of major forex trading sessions (London, New York, Tokyo).
- **Bot & Environment Info**: A section to display the configuration details of your trading environment (server, login, etc.).
- **Built-in Help & FAQ**: An accordion-style FAQ section to answer common questions about how the application works.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI**: [Genkit](https://firebase.google.com/docs/genkit)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- An account with a Generative AI provider (e.g., Google AI Studio) to obtain an API key.
- A Telegram Bot and Chat ID for notifications.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Environment Configuration

Create a `.env` file in the root of the project and add the following variables. These are essential for the AI and Telegram functionalities.

```
# From your AI provider (e.g., Google AI Studio)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# From Telegram (create a bot with @BotFather)
TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
TELEGRAM_CHAT_ID="YOUR_TELEGRAM_CHAT_ID"

# Optional: For display purposes in the "Bot Info" component
MT_SERVER="YourMTServer"
MT_LOGIN="YourMTLogin"
MT_PASSWORD="YourMTPassword"
```

### Running the Application

1.  **Start the Genkit development server:**
    This runs the AI flows defined in the application.
    ```bash
    npm run genkit:watch
    ```

2.  **Start the Next.js development server:**
    In a separate terminal, run:
    ```bash
    npm run dev
    ```

The application will be available at [http://localhost:9002](http://localhost:9002).

## How It Works

The application is structured into several key components:

- **Frontend (`src/components`)**: Contains all the React components for the UI, including the dashboard, signal generation form, risk calculator, and more.
- **AI Flows (`src/ai/flows`)**: These are server-side Genkit files that define the logic for interacting with the generative AI model to create trade signals.
- **Server Actions (`src/app/actions.ts`)**: Handles form submissions from the client, invokes the AI flows, and triggers Telegram notifications.
- **Configuration (`src/lib`)**: Contains constants, type definitions, and utility functions used throughout the application.
