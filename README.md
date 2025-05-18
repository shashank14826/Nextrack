# Nextrack - Smart Expense Management App

Nextrack is a modern, user-friendly expense management application that helps you track your income, expenses, and manage multiple accounts efficiently. Built with React Native and Node.js, it provides a seamless experience across both iOS and Android platforms.

## Features

### 📱 User Interface
- Clean, intuitive interface with dark/light mode support
- Responsive design that works on both iOS and Android
- Smooth animations and transitions
- Material Design-inspired components

### 💰 Account Management
- Create and manage multiple accounts (Savings, Current, Investment, etc.)
- Track balance, income, and expenses for each account
- Real-time balance updates
- Account-specific transaction history

### 📊 Transaction Tracking
- Add income and expenses with detailed categorization
- Customizable categories for both income and expenses
- Transaction history with filtering and sorting options
- Date-based transaction recording
- Optional transaction descriptions

### 📈 Analysis & Insights
- Visual representation of income vs expenses
- Category-wise expense breakdown
- Monthly spending patterns
- Interactive charts and graphs

### 🔐 Security & Privacy
- Secure user authentication
- JWT-based session management
- Protected API endpoints
- Secure data storage

### 🎨 Personalization
- Dark/Light theme support
- Customizable user profile
- Personalized dashboard
- Account preferences

## Tech Stack

### Frontend
- React Native
- Expo
- React Navigation
- React Native Paper
- React Native Chart Kit
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Mongoose ODM

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shashank14826/Nextrack.git
cd Nextrack
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Set up environment variables:
   - Create a `.env` file in the backend directory
   - Add the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5001
     ```

5. Start the backend server:
```bash
cd backend
npm start
```

6. Start the frontend development server:
```bash
# In the root directory
npm start
```

7. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Project Structure

```
Nextrack/
├── app/                    # Frontend React Native app
│   ├── components/        # Reusable UI components
│   ├── context/          # Context providers
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   ├── services/         # API services
│   └── utils/            # Utility functions
├── backend/              # Backend Node.js/Express app
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   └── routes/          # API routes
└── assets/              # Static assets
```

## Deployment

### Backend Deployment
1. Set up a MongoDB Atlas cluster
2. Configure environment variables on your hosting platform
3. Deploy to your preferred hosting service (e.g., Heroku, DigitalOcean, AWS)
4. Set up SSL certificates for secure HTTPS connections
5. Configure CORS settings for production

### Frontend Deployment
1. Build the Expo app for production:
```bash
expo build:android  # For Android
expo build:ios     # For iOS
```
2. Submit to app stores:
   - Follow [Expo's guide](https://docs.expo.dev/distribution/app-stores/) for app store submission
   - Prepare app store assets (screenshots, descriptions, etc.)
   - Configure app signing and certificates

## Testing

### Backend Testing
1. Unit Tests:
```bash
cd backend
npm test
```
2. API Testing:
   - Use Postman or similar tools to test API endpoints
   - Verify authentication flows
   - Test data validation and error handling

### Frontend Testing
1. Component Testing:
```bash
npm test
```
2. Manual Testing Checklist:
   - Test on both iOS and Android devices
   - Verify all navigation flows
   - Test offline functionality
   - Check dark/light theme switching
   - Verify data persistence
   - Test form validations

## Troubleshooting

### Common Issues

#### Backend Issues
1. MongoDB Connection Errors
   - Verify MongoDB URI in `.env`
   - Check network connectivity
   - Ensure MongoDB service is running

2. Authentication Problems
   - Verify JWT secret in `.env`
   - Check token expiration
   - Validate request headers

#### Frontend Issues
1. Build Errors
   - Clear Metro bundler cache: `expo start -c`
   - Update Expo SDK: `expo upgrade`
   - Check for conflicting dependencies

2. Runtime Errors
   - Enable debug mode in Expo
   - Check console logs
   - Verify API endpoint URLs

### Performance Optimization
1. Backend
   - Implement caching strategies
   - Optimize database queries
   - Use compression middleware
   - Implement rate limiting

2. Frontend
   - Optimize image assets
   - Implement lazy loading
   - Use memoization for expensive computations
   - Minimize re-renders

## Development Guidelines

### Code Style
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Document complex functions and components

### Git Workflow
1. Branch Naming Convention:
   - feature/feature-name
   - bugfix/bug-description
   - hotfix/issue-description

2. Commit Message Format:
   - feat: new feature
   - fix: bug fix
   - docs: documentation changes
   - style: code style changes
   - refactor: code refactoring
   - test: adding tests
   - chore: maintenance tasks

### Security Best Practices
1. Backend
   - Use environment variables for sensitive data
   - Implement rate limiting
   - Sanitize user inputs
   - Use HTTPS only
   - Regular security audits

2. Frontend
   - Secure storage for sensitive data
   - Input validation
   - XSS prevention
   - Regular dependency updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)

## Contact

Shashank SP - [@shashank14826](https://github.com/shashank14826)

Project Link: [https://github.com/shashank14826/Nextrack](https://github.com/shashank14826/Nextrack) 