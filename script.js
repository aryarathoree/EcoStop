import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from './firebase.js';
import {
  db,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion
} from './firebase.js';

// Splash screen animation (only for index.html)
if (window.location.pathname.endsWith('index.html')) {
  setTimeout(() => {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('main-content').classList.remove('hidden');
  }, 3000);
}

// Handle authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user);
    if (window.location.pathname.endsWith('index.html')) {
      window.location.href = 'buy-sell.html';
    }
  } else {
    console.log('User is signed out');
    if (!window.location.pathname.endsWith('index.html')) {
      window.location.href = 'index.html';
    }
  }
});

// Show Sign Up Form (only for index.html)
if (window.location.pathname.endsWith('index.html')) {
  document.getElementById('show-signup-btn')?.addEventListener('click', () => {
    document.getElementById('signup-form-container').classList.remove('hidden');
    document.getElementById('login-form-container').classList.add('hidden');
  });

  // Show Login Form
  document.getElementById('show-login-btn')?.addEventListener('click', () => {
    document.getElementById('login-form-container').classList.remove('hidden');
    document.getElementById('signup-form-container').classList.add('hidden');
  });

  // Cancel Sign Up Form
  document.getElementById('cancel-signup-btn')?.addEventListener('click', () => {
    document.getElementById('signup-form-container').classList.add('hidden');
  });

  // Cancel Login Form
  document.getElementById('cancel-login-btn')?.addEventListener('click', () => {
    document.getElementById('login-form-container').classList.add('hidden');
  });

  // Sign Up Form Submission
  document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (password.length < 6) {
      document.getElementById('signup-error-message').textContent = 'Password must be at least 6 characters long.';
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Signup successful! User:', user);
      alert('Signup successful!');
      window.location.href = 'buy-sell.html';
    } catch (error) {
      console.error('Signup failed:', error);
      document.getElementById('signup-error-message').textContent = error.message;
    }
  });

  // Login Form Submission
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Login successful! User:', user);
      alert('Login successful!');
      window.location.href = 'buy-sell.html';
    } catch (error) {
      console.error('Login failed:', error);
      document.getElementById('login-error-message').textContent = error.message;
    }
  });
}

// Logout (only for buy-sell.html, buy-items.html, sell-items.html)
if (!window.location.pathname.endsWith('index.html')) {
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
      alert('Logged out successfully!');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout failed:', error);
      alert(`Logout failed: ${error.message}`);
    }
  });
}

// Buy/Sell Navigation (only for buy-sell.html)
if (window.location.pathname.endsWith('buy-sell.html')) {
  document.getElementById('buy-btn')?.addEventListener('click', () => {
    window.location.href = 'buy-items.html';
  });

  document.getElementById('sell-btn')?.addEventListener('click', () => {
    window.location.href = 'sell-items.html';
  });

  document.getElementById('my-listings-btn')?.addEventListener('click', () => {
    window.location.href = 'my-listings.html';
  });

  document.getElementById('my-purchases-btn')?.addEventListener('click', () => {
    window.location.href = 'my-purchases.html';
  });
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Get user's current location
document.getElementById('get-location-btn')?.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        localStorage.setItem('userLocation', JSON.stringify(userLocation));

        // Update location field on sell-items page
        if (window.location.pathname.endsWith('sell-items.html')) {
          document.getElementById('location').value = `${userLocation.latitude},${userLocation.longitude}`;
        }

        alert('Location fetched successfully!');
      },
      (error) => {
        console.error('Error fetching location:', error);
        alert('Failed to fetch location. Please enable location services.');
      }
    );
  } else {
    alert('Geolocation is not supported by this browser.');
  }
});

// Fetch and display products on the Buy Items Page
if (window.location.pathname.endsWith('buy-items.html')) {
  const itemGrid = document.getElementById('item-grid');
  const cityFilter = document.getElementById('city-filter');
  const radiusFilter = document.getElementById('radius-filter');
  const applyFilter = document.getElementById('apply-filter');

  const fetchProducts = async (city = '', radius = 50) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      itemGrid.innerHTML = ''; // Clear existing products

      const userLocation = JSON.parse(localStorage.getItem('userLocation'));

      querySnapshot.forEach((doc) => {
        const product = doc.data();
        const productLocation = product.location.split(','); // Assuming location is stored as "lat,lon"
        const productLat = parseFloat(productLocation[0]);
        const productLon = parseFloat(productLocation[1]);

        let shouldDisplay = true;

        // Filter by city
        if (city && !product.location.toLowerCase().includes(city.toLowerCase())) {
          shouldDisplay = false;
        }

        // Filter by radius
        if (userLocation && radius) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            productLat,
            productLon
          );
          if (distance > radius) {
            shouldDisplay = false;
          }
        }

        if (shouldDisplay) {
          const productElement = document.createElement('div');
          productElement.classList.add('item');
          productElement.innerHTML = `
            <h3>${product.productName}</h3>
            <p class="price">$${product.price}</p>
            <p class="location">${product.location}</p>
            <p class="description">${product.description}</p>
            <div class="message-section">
              <input type="text" class="message-input" placeholder="Send a message to the seller">
              <button class="deal-btn" data-id="${doc.id}">Deal</button>
            </div>
          `;
          itemGrid.appendChild(productElement);
        }
      });

      // Add event listeners to Deal buttons
      document.querySelectorAll('.deal-btn').forEach((button) => {
        button.addEventListener('click', async () => {
          const productId = button.getAttribute('data-id');
          const messageInput = button.previousElementSibling; // Get the message input
          const message = messageInput.value;

          const user = auth.currentUser;
          if (!user) {
            alert('You must be logged in to send a message.');
            return;
          }

          if (!message) {
            alert('Please enter a message.');
            return;
          }

          try {
            // Add message to Firestore
            const productRef = doc(db, 'products', productId);
            await updateDoc(productRef, {
              messages: arrayUnion({
                buyerId: user.uid,
                message: message,
                timestamp: new Date().toISOString(),
              }),
            });

            alert('Message sent successfully!');
            messageInput.value = ''; // Clear the input
          } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
          }
        });
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products. Please try again.');
    }
  };

  // Apply filters
  applyFilter.addEventListener('click', () => {
    const city = cityFilter.value;
    const radius = parseFloat(radiusFilter.value) || 50; // Default radius is 50km
    fetchProducts(city, radius);
  });

  fetchProducts(); // Fetch products when the page loads
}

// Fetch and display seller's listings on the Sell Items Page
if (window.location.pathname.endsWith('sell-items.html')) {
  const fetchListings = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log('User not logged in');
      return; // Remove alert for "You must be logged in to view your listings."
    }

    try {
      const listingsGrid = document.getElementById('my-listings-grid');
      listingsGrid.innerHTML = ''; // Clear existing listings

      const querySnapshot = await getDocs(collection(db, 'products'));
      querySnapshot.forEach((doc) => {
        const product = doc.data();
        if (product.sellerId === user.uid) {
          const productElement = document.createElement('div');
          productElement.classList.add('item');
          productElement.innerHTML = `
            <h3>${product.productName}</h3>
            <p class="price">$${product.price}</p>
            <p class="location">${product.location}</p>
            <p class="description">${product.description}</p>
            <div class="messages">
              <h4>Messages:</h4>
              ${product.messages ? product.messages.map(msg => `<p><strong>${msg.buyerId}:</strong> ${msg.message}</p>`).join('') : 'No messages yet.'}
            </div>
            <button class="delete-btn" data-id="${doc.id}">Delete</button>
          `;
          listingsGrid.appendChild(productElement);
        }
      });

      // Add event listeners to Delete buttons
      document.querySelectorAll('.delete-btn').forEach((button) => {
        button.addEventListener('click', async () => {
          const productId = button.getAttribute('data-id');
          await deleteDoc(doc(db, 'products', productId)); // Remove product from Firestore
          alert('Product deleted successfully!');
          fetchListings(); // Refresh the listings
        });
      });
    } catch (error) {
    }
  };
  fetchListings();

  // Sell Items Form Submission
  document.getElementById('sell-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to list a product.');
      return;
    }
  
    const productName = document.getElementById('product-name').value;
    const price = document.getElementById('price').value;
    const location = document.getElementById('location').value;
    const description = document.getElementById('description').value;
  
    try {
      // Add product to Firestore with sellerId and an empty messages array
      await addDoc(collection(db, 'products'), {
        productName,
        price,
        location,
        description,
        sellerId: user.uid, // Add sellerId to track who listed the product
        createdAt: new Date().toISOString(),
        messages: [], // Initialize messages as an empty array
      });
  
      alert('Product listed successfully!');
      document.getElementById('sell-form').reset(); // Clear the form
      window.location.href = 'my-listings.html'; // Redirect to My Listings page
    } catch (error) {
      console.error('Error listing product:', error);
      alert('Failed to list product. Please try again.');
    }
  });
}

// Fetch and display user's listings on the My Listings Page
if (window.location.pathname.endsWith('my-listings.html')) {
  const listingsGrid = document.getElementById('my-listings-grid');

  // Use onAuthStateChanged to check authentication state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User is signed in:', user);

      // Real-time listener for listings
      const unsubscribe = onSnapshot(collection(db, 'products'), (querySnapshot) => {
        console.log('Snapshot received:', querySnapshot.docs); // Debugging
        listingsGrid.innerHTML = ''; // Clear existing listings

        querySnapshot.forEach((doc) => {
          const product = doc.data();
          console.log('Product:', product); // Debugging
          if (product.sellerId === user.uid) {
            const productElement = document.createElement('div');
            productElement.classList.add('item');
            productElement.innerHTML = `
              <h3>${product.productName}</h3>
              <p class="price">$${product.price}</p>
              <p class="location">${product.location}</p>
              <p class="description">${product.description}</p>
              <div class="messages">
                <h4>Messages:</h4>
                ${product.messages ? product.messages.map(msg => `<p><strong>${msg.buyerId}:</strong> ${msg.message}</p>`).join('') : 'No messages yet.'}
              </div>
              <button class="delete-btn" data-id="${doc.id}">Delete</button>
            `;
            listingsGrid.appendChild(productElement);
          }
        });

        // Add event listeners to Delete buttons
        document.querySelectorAll('.delete-btn').forEach((button) => {
          button.addEventListener('click', async () => {
            const productId = button.getAttribute('data-id');
            await deleteDoc(doc(db, 'products', productId)); // Remove product from Firestore
            alert('Product deleted successfully!');
          });
        });
      });

      // Clean up listener when the page is unloaded
      window.addEventListener('unload', () => {
        unsubscribe();
      });
    } else {
      console.log('User is signed out');
      alert('You must be logged in to view your listings.');
      window.location.href = 'index.html';
    }
  });
}

if (window.location.pathname.endsWith('buy-items.html')) {
  const itemGrid = document.getElementById('item-grid');
  const cityFilter = document.getElementById('city-filter');
  const radiusFilter = document.getElementById('radius-filter');
  const applyFilter = document.getElementById('apply-filter');

  const fetchProducts = async (city = '', radius = 50) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      itemGrid.innerHTML = ''; // Clear existing products

      const userLocation = JSON.parse(localStorage.getItem('userLocation'));

      querySnapshot.forEach((doc) => {
        const product = doc.data();
        const productLocation = product.location.split(','); // Assuming location is stored as "lat,lon"
        const productLat = parseFloat(productLocation[0]);
        const productLon = parseFloat(productLocation[1]);

        let shouldDisplay = true;

        // Filter by city
        if (city && !product.location.toLowerCase().includes(city.toLowerCase())) {
          shouldDisplay = false;
        }

        // Filter by radius
        if (userLocation && radius) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            productLat,
            productLon
          );
          if (distance > radius) {
            shouldDisplay = false;
          }
        }

        if (shouldDisplay) {
          const productElement = document.createElement('div');
          productElement.classList.add('item');
          productElement.innerHTML = `
            <h3>${product.productName}</h3>
            <p class="price">$${product.price}</p>
            <p class="location">${product.location}</p>
            <p class="description">${product.description}</p>
            <div class="message-section">
              <input type="text" class="message-input" placeholder="Send a message to the seller">
              <button class="deal-btn" data-id="${doc.id}">Deal</button>
            </div>
          `;
          itemGrid.appendChild(productElement);
        }
      });

      // Add event listeners to Deal buttons
      document.querySelectorAll('.deal-btn').forEach((button) => {
        button.addEventListener('click', async () => {
          const productId = button.getAttribute('data-id');
          const messageInput = button.previousElementSibling; // Get the message input
          const message = messageInput.value;

          const user = auth.currentUser;
          if (!user) {
            alert('You must be logged in to send a message.');
            return;
          }

          if (!message) {
            alert('Please enter a message.');
            return;
          }

          try {
            // Add message to Firestore
            const productRef = doc(db, 'products', productId);
            await updateDoc(productRef, {
              messages: arrayUnion({
                buyerId: user.uid,
                message: message,
                timestamp: new Date().toISOString(),
              }),
            });

            alert('Message sent successfully!');
            messageInput.value = ''; // Clear the input
          } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
          }
        });
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products. Please try again.');
    }
  };

  // Apply filters
  applyFilter.addEventListener('click', () => {
    const city = cityFilter.value;
    const radius = parseFloat(radiusFilter.value) || 50; // Default radius is 50km
    fetchProducts(city, radius);
  });

  fetchProducts(); // Fetch products when the page loads
}
// Go Back Button (for my-listings.html and my-purchases.html)
if (window.location.pathname.endsWith('my-listings.html') || window.location.pathname.endsWith('my-purchases.html')) {
  document.getElementById('back-btn')?.addEventListener('click', () => {
    window.location.href = 'buy-sell.html';
  });
}