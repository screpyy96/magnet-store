# MagnetCraft - Custom Fridge Magnets Store

A modern e-commerce platform for creating and ordering custom fridge magnets, built with Next.js 14 and Supabase.

## Features

- 🛍️ Modern e-commerce interface
- 📱 Responsive design with mobile-first approach
- 🔐 Secure authentication with Supabase
- 🎨 Custom magnet design tool
- 🛒 Shopping cart functionality
- 💳 Secure payment processing
- 📦 Order tracking system

## Tech Stack

- **Frontend:** Next.js 14, React, TailwindCSS
- **Backend:** Supabase
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage
- **Styling:** TailwindCSS
- **Icons:** HeroIcons

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/screpyy96/magnet-store.git
   ```

2. Install dependencies:
   ```bash
   cd magnet-store
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then add your Supabase credentials to `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
magnet-store/
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── contexts/      # React contexts
│   ├── lib/          # Utility functions
│   └── styles/       # Global styles
├── public/           # Static files
└── ...config files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
