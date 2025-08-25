const bcrypt = require('bcryptjs')

async function generateHash() {
  try {
    const userName = 'root'
    const password = 'superadmin123'
    const hash = await bcrypt.hash(password, 12)
    
    console.log('=== BCRYPT HASH GENERATOR ===')
    console.log('Password:', password)
    console.log('Hash:', hash)
    console.log('\n=== COPY THIS HASH TO MONGODB ===')
    console.log(hash)
    
    // Test the hash
    const isValid = await bcrypt.compare(password, hash)
    console.log('\n=== VERIFICATION ===')
    console.log('Hash is valid:', isValid)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

generateHash()
