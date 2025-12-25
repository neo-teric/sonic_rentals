import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testRejectBooking() {
  try {
    console.log('🧪 Starting Reject Booking Test...\n')

    // Step 1: Get available equipment
    console.log('Step 1: Fetching available equipment...')
    const equipment = await prisma.equipment.findMany({
      where: { status: 'Active' },
      take: 1,
    })

    if (equipment.length === 0) {
      console.error('❌ No active equipment found. Please seed the database first.')
      return
    }

    const testEquipment = equipment[0]
    console.log(`✅ Found equipment: ${testEquipment.name} (ID: ${testEquipment.id})`)

    // Step 2: Set up test dates
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
    dayAfterTomorrow.setHours(18, 0, 0, 0)

    const pickupDate = tomorrow.toISOString()
    const returnDate = dayAfterTomorrow.toISOString()

    console.log(`\nStep 2: Test dates:`)
    console.log(`   - Pickup: ${pickupDate}`)
    console.log(`   - Return: ${returnDate}`)

    // Step 3: Create a booking
    console.log(`\nStep 3: Creating booking...`)
    const booking = await createBooking({
      customerName: 'Test Reject User',
      customerEmail: 'testreject@example.com',
      customerPhone: '555-9999',
      pickupDate,
      returnDate,
      equipmentIds: [testEquipment.id],
      totalPrice: testEquipment.dayRate * 2,
      deposit: testEquipment.dayRate * 0.5,
      deliveryOption: 'WarehousePickup',
    })

    console.log(`✅ Booking created:`)
    console.log(`   - Booking ID: ${booking.id}`)
    console.log(`   - Status: ${booking.status}`)

    // Step 4: Verify booking exists in bookings table
    console.log(`\nStep 4: Verifying booking exists in bookings table...`)
    const bookingBeforeReject = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        bookingItems: true,
      },
    })

    if (bookingBeforeReject) {
      console.log(`✅ Booking found in bookings table`)
      console.log(`   - Has ${bookingBeforeReject.bookingItems.length} booking items`)
    } else {
      console.log(`❌ TEST FAILED: Booking not found in bookings table`)
      return
    }

    // Step 5: Check past bookings before rejection
    console.log(`\nStep 5: Checking past bookings before rejection...`)
    const pastBookingsBefore = await prisma.pastBooking.findMany({
      where: {
        originalBookingId: booking.id,
      },
    })
    console.log(`   Past bookings with this ID: ${pastBookingsBefore.length} (should be 0)`)

    // Step 6: Reject the booking
    console.log(`\nStep 6: Rejecting booking...`)
    const rejectReason = 'Test rejection - equipment not available'
    
    // Simulate the reject API call
    const pastBooking = await prisma.$transaction(async (tx) => {
      // Get booking with all related data
      const bookingToReject = await tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          package: true,
          bookingItems: {
            include: {
              equipment: true,
              addOn: true,
            },
          },
        },
      })

      if (!bookingToReject) {
        throw new Error('Booking not found')
      }

      // Create past booking record
      const pastBooking = await tx.pastBooking.create({
        data: {
          originalBookingId: bookingToReject.id,
          userId: bookingToReject.userId,
          packageId: bookingToReject.packageId,
          packageName: bookingToReject.package?.name || null,
          pickupDate: bookingToReject.pickupDate,
          returnDate: bookingToReject.returnDate,
          totalPrice: bookingToReject.totalPrice,
          deposit: bookingToReject.deposit,
          originalStatus: bookingToReject.status,
          action: 'rejected',
          actionBy: null, // In real scenario, this would be admin user ID
          actionReason: rejectReason,
          deliveryOption: bookingToReject.deliveryOption,
          signature: bookingToReject.signature,
          idUploadUrl: bookingToReject.idUploadUrl,
          stripePaymentIntentId: bookingToReject.stripePaymentIntentId,
          stripeDepositIntentId: bookingToReject.stripeDepositIntentId,
          inspectionCompleted: bookingToReject.inspectionCompleted,
          depositRefunded: bookingToReject.depositRefunded,
          lateFee: bookingToReject.lateFee,
          createdAt: bookingToReject.createdAt,
          updatedAt: bookingToReject.updatedAt,
          pastBookingItems: {
            create: bookingToReject.bookingItems.length > 0
              ? bookingToReject.bookingItems.map((item) => ({
                  equipmentId: item.equipmentId,
                  equipmentName: item.equipment?.name || null,
                  addOnId: item.addOnId,
                  addOnName: item.addOn?.name || null,
                  quantity: item.quantity,
                }))
              : [],
          },
        },
      })

      // Delete the original booking
      await tx.booking.delete({
        where: { id: booking.id },
      })

      return pastBooking
    })

    console.log(`✅ Booking rejected:`)
    console.log(`   - Past Booking ID: ${pastBooking.id}`)
    console.log(`   - Action: ${pastBooking.action}`)
    console.log(`   - Reason: ${pastBooking.actionReason}`)

    // Step 7: Verify booking removed from bookings table
    console.log(`\nStep 7: Verifying booking removed from bookings table...`)
    const bookingAfterReject = await prisma.booking.findUnique({
      where: { id: booking.id },
    })

    if (!bookingAfterReject) {
      console.log(`✅ TEST PASSED: Booking removed from bookings table`)
    } else {
      console.log(`❌ TEST FAILED: Booking still exists in bookings table`)
    }

    // Step 8: Verify past booking created
    console.log(`\nStep 8: Verifying past booking created...`)
    const pastBookingAfter = await prisma.pastBooking.findUnique({
      where: { id: pastBooking.id },
      include: {
        pastBookingItems: true,
      },
    })

    if (pastBookingAfter) {
      console.log(`✅ TEST PASSED: Past booking created successfully`)
      console.log(`   - Original Booking ID: ${pastBookingAfter.originalBookingId}`)
      console.log(`   - Action: ${pastBookingAfter.action}`)
      console.log(`   - Original Status: ${pastBookingAfter.originalStatus}`)
      console.log(`   - Has ${pastBookingAfter.pastBookingItems.length} past booking items`)
      
      if (pastBookingAfter.actionReason === rejectReason) {
        console.log(`✅ Reason correctly stored: "${pastBookingAfter.actionReason}"`)
      } else {
        console.log(`❌ Reason mismatch: expected "${rejectReason}", got "${pastBookingAfter.actionReason}"`)
      }
    } else {
      console.log(`❌ TEST FAILED: Past booking not found`)
    }

    // Step 9: Verify past booking items
    console.log(`\nStep 9: Verifying past booking items...`)
    if (pastBookingAfter && pastBookingAfter.pastBookingItems.length > 0) {
      console.log(`✅ Past booking items created:`)
      pastBookingAfter.pastBookingItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.equipmentName || item.addOnName || 'Unknown'} x${item.quantity}`)
      })
    } else if (pastBookingAfter && pastBookingAfter.pastBookingItems.length === 0) {
      console.log(`⚠️  No past booking items (booking had no items)`)
    } else {
      console.log(`❌ TEST FAILED: Past booking items not found`)
    }

    // Step 10: Verify calendar doesn't show rejected booking
    console.log(`\nStep 10: Verifying calendar doesn't show rejected booking...`)
    const calendarBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['Confirmed', 'Active', 'Completed'] },
        id: booking.id, // Should not find it
      },
    })

    if (calendarBookings.length === 0) {
      console.log(`✅ TEST PASSED: Rejected booking not in calendar (as expected)`)
    } else {
      console.log(`❌ TEST FAILED: Rejected booking still appears in calendar`)
    }

    console.log(`\n🎉 Test completed!`)
    console.log(`\nNote: The test past booking is still in the database.`)
    console.log(`Run 'npm run db:clear-bookings' to clean it up (it will also clear past bookings).`)

  } catch (error) {
    console.error('❌ Test failed with error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function createBooking(data: {
  customerName: string
  customerEmail: string
  customerPhone: string
  pickupDate: string
  returnDate: string
  equipmentIds: string[]
  totalPrice: number
  deposit: number
  deliveryOption: string
}) {
  // Create or get user
  let user = await prisma.user.findUnique({
    where: { email: data.customerEmail },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.customerEmail,
        name: data.customerName,
        phone: data.customerPhone,
        role: 'customer',
      },
    })
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      packageId: null,
      pickupDate: new Date(data.pickupDate),
      returnDate: new Date(data.returnDate),
      totalPrice: data.totalPrice,
      deposit: data.deposit,
      status: 'Pending',
      deliveryOption: data.deliveryOption,
    },
  })

  // Create booking items for equipment
  for (const equipmentId of data.equipmentIds) {
    await prisma.bookingItem.create({
      data: {
        bookingId: booking.id,
        equipmentId,
        quantity: 1,
      },
    })
  }

  return booking
}

testRejectBooking()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

