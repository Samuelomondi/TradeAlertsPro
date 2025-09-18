# TradeAlert

TradeAlert is a web application designed to assist forex traders by generating trade signals using deterministic technical analysis. It provides a dashboard with tools for signal generation, risk management, trade history tracking, and a comprehensive sentiment analysis view with crucial market information. It also integrates with Telegram to send real-time signal notifications.

## Features

- **Logic-Based Signal Generation**: Input a currency pair and timeframe to get a trade signal based on a consistent, deterministic set of rules. The system analyzes technical indicators (EMA, RSI, ATR) to generate a signal with an entry, stop loss, take profit, and a calculated lot size.
- **Telegram Notifications**: Automatically sends generated trade signals to a designated Telegram chat, allowing you to receive trade ideas on the go.
- **Persistent Trade History**: Keeps a running log of all generated signals, saved in your browser's local storage. You can update the status of each trade (Won, Lost, Open) to track your performance over time.
- **Trade Performance Dashboard**: A visual summary of your trading performance, including total trades, wins, losses, and your win rate, calculated from your trade history.
- **Risk Settings**: Configure your account balance and risk percentage to automatically calculate the appropriate position size for every trade signal.
- **Live Market Hours**: A live dashboard showing the open/closed status of major forex trading sessions (London, New York, Tokyo) to help you understand the current market environment.
- **Comprehensive News & Sentiment Analysis**: A multi-faceted view that includes:
    - An AI-generated list of upcoming high-impact economic events.
    - An AI-powered sentiment analysis tool that scrapes recent news for a currency pair to determine if the market mood is Positive, Negative, or Neutral.
    - An overview of key market sentiment indicators.
- **System Status Dashboard**: A utility panel that checks and displays the configuration status of all required services (Generative AI, Market Data API, Telegram), making it easy to diagnose setup issues.
- **Built-in Help & FAQ**: An accordion-style FAQ section to answer common questions about how the application works.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI**: [Genkit](https://firebase.google.com/docs/genkit) (for news analysis)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- An account with a Generative AI provider (e.g., Google AI Studio) to obtain an API key.
- A [Twelve Data](https://twelvedata.com/) account for a market data API key.
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

Create a `.env` file in the root of the project and add the following variables. These are essential for the AI, market data, and Telegram functionalities.

```
# From your AI provider (e.g., Google AI Studio)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# From Twelve Data (https://twelvedata.com/)
TWELVE_DATA_API_KEY="YOUR_TWELVE_DATA_API_KEY"

# From Telegram (create a bot with @BotFather)
TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
TELEGRAM_CHAT_ID="YOUR_TELEGRAM_CHAT_ID"
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
- **AI Flows (`src/ai/flows`)**: These are server-side Genkit files. `signal-generation-gen-ai.ts` contains the deterministic logic for trade signals. Other flows in this directory define the logic for interacting with the generative AI model to create the economic news list and analyze news sentiment.
- **Server Actions (`src/app/actions.ts`)**: Handles form submissions from the client, invokes the signal generation logic and AI flows, and triggers Telegram notifications.
- **Services (`src/services`)**: Contains the logic for fetching live market data from external APIs like Twelve Data.
- **Configuration (`src/lib`)**: Contains constants, type definitions, and utility functions used throughout the application.
