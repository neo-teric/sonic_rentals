import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearBookings() {
  try {
    console.log('Clearing all booking data...')
    
    // Delete in order to respect foreign key constraints
    // 1. Delete inspection checklists (references bookings)
    const deletedChecklists = await prisma.inspectionChecklist.deleteMany({})
    console.log(`Deleted ${deletedChecklists.count} inspection checklists`)
    
    // 2. Delete booking items (references bookings)
    const deletedBookingItems = await prisma.bookingItem.deleteMany({})
    console.log(`Deleted ${deletedBookingItems.count} booking items`)
    
    // 3. Delete bookings
    const deletedBookings = await prisma.booking.deleteMany({})
    console.log(`Deleted ${deletedBookings.count} bookings`)
    
    // 4. Delete past booking items (references past bookings)
    const deletedPastBookingItems = await prisma.pastBookingItem.deleteMany({})
    console.log(`Deleted ${deletedPastBookingItems.count} past booking items`)
    
    // 5. Delete past bookings
    const deletedPastBookings = await prisma.pastBooking.deleteMany({})
    console.log(`Deleted ${deletedPastBookings.count} past bookings`)
    
    console.log('✅ All booking data cleared successfully!')
  } catch (error) {
    console.error('Error clearing bookings:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearBookings()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

