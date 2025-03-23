# EcoStop - Your Stop to Contribute Towards Sustainability

## A Sustainable Marketplace for Buying & Selling Locally

**EcoStop** is a web-based marketplace that enables users to buy and sell second-hand, recycled, or recyclable items locally. It leverages Firebase for authentication, real-time database updates, and messaging, along with the Geolocation API for location-based product filtering.

## Features

- **User Authentication**: Secure sign-up and login using Firebase Authentication.
- **Sell Products**: Users can list items for sale, which get updated in real-time in "My Listings".
- **Buy Products**: Users can browse products available within a set radius using the Geolocation API.
- **Make a Deal**: Buyers can contact sellers directly via a messaging system when interested in a product.
- **Real-Time Updates**: Items listed for sale appear instantly in "My Listings".
- **Logout Option**: Users can securely log out of their accounts.

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Firebase Authentication
- Firebase Realtime Database / Firestore

### APIs Used
- **Firebase Authentication**: Handles user login and signup securely.
- **Firebase Realtime Database / Firestore**: Stores product listings and messages in real-time.
- **Geolocation API**: Enables location-based filtering for buying and selling within a certain radius.

## Installation & Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/yourusername/EcoStop.git
   cd EcoStop
   ```
2. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Authentication and Firestore Database.
   - Copy Firebase configuration and replace it in your project.

3. **Run the project**
   - Open `index.html` in your browser or use a local server.

## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests to improve the project.