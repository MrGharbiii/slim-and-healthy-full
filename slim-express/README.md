# Slim Backend

A lightweight Express.js backend server built with Node.js and Yarn.

## Features

- 🚀 Express.js web framework
- 🛡️ Security with Helmet
- 🌐 CORS enabled
- 📝 Request logging with Morgan
- 🔧 Environment configuration with dotenv
- 🧪 Ready for testing with Jest
- 🔄 Hot reload with Nodemon

## Prerequisites

- Node.js (v14 or higher)
- Yarn package manager

## Installation

1. Install dependencies:

```bash
yarn install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Edit the `.env` file with your configuration

## Usage

### Development

```bash
yarn dev
```

### Production

```bash
yarn start
```

### Testing

```bash
yarn test
```

## API Endpoints

### Health Check

- `GET /api/health` - Returns server status

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Project Structure

```
slim-backend/
├── src/
│   ├── app.js          # Main application file
│   └── routes/
│       └── users.js    # User routes
├── package.json        # Dependencies and scripts
├── .env               # Environment variables
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Environment Variables

| Variable   | Description      | Default       |
| ---------- | ---------------- | ------------- |
| `NODE_ENV` | Environment mode | `development` |
| `PORT`     | Server port      | `3000`        |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
