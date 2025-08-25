// Database collections and validation schemas

export const collections = {
    USERS: 'users',
    LOCATIONS: 'locations', 
    SCREENS: 'screens',
    EVENTS: 'events',
    BOOKINGS: 'bookings',
    SERVICES: 'services',
    PROMOTIONS: 'promotions',
    REVIEWS: 'reviews'
  }
  
  // Validation helpers
  export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  export const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/ // Indian mobile number format
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }
  
  // Sample data structure for reference
  export const sampleData = {
    location: {
      name: "Happy Screens Koramangala",
      address: "123 Forum Mall, Koramangala",
      city: "Bangalore",
      phone: "+91 9876543210",
      email: "koramangala@happyscreens.com",
      coordinates: { lat: 12.9352, lng: 77.6245 },
      facilities: ["Parking", "Food Court", "Restrooms"],
      images: ["url1.jpg", "url2.jpg"],
      isActive: true
    },
    screen: {
      name: "Premium Screen A",
      locationId: "location_object_id",
      capacity: 12,
      dimensions: "12ft x 8ft",
      features: ["4K Display", "Dolby Surround", "Recliner Seats"],
      amenities: {
        soundSystem: "Dolby Atmos 7.1",
        projectionType: "4K Laser Projector", 
        seatingType: "Premium Leather Recliners",
        airConditioning: true,
        wifi: true
      },
      pricing: { basePrice: 2000, hourlyRate: 500 },
      images: ["screen1.jpg", "screen2.jpg"],
      videos: ["tour.mp4"],
      isActive: true
    }
  }
  