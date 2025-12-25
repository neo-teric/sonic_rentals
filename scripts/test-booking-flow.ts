import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testBookingFlow() {
  try {
    console.log('🧪 Starting Booking Flow Test...\n')

    // Step 1: Get available equipment
    console.log('Step 1: Fetching available equipment...')
    const equipment = await prisma.equipment.findMany({
      where: { status: 'Active' },
      take: 2, // Get 2 pieces of equipment for testing
    })

    if (equipment.length === 0) {
      console.error('❌ No active equipment found. Please seed the database first.')
      return
    }

    console.log(`✅ Found ${equipment.length} equipment items:`)
    equipment.forEach((eq) => {
      console.log(`   - ${eq.name} (ID: ${eq.id}, Quantity: ${eq.quantity})`)
    })

    const testEquipmentId = equipment[0].id
    const testEquipment = equipment[0]

    // Step 2: Set up test dates (tomorrow to day after tomorrow)
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

    // Step 3: Check initial availability
    console.log(`\nStep 3: Checking initial availability...`)
    const initialAvailability = await checkAvailability(pickupDate, returnDate, [testEquipmentId])
    console.log(`   Equipment ${testEquipment.name}: ${initialAvailability[testEquipmentId] ? '✅ Available' : '❌ Not Available'}`)
    console.log(`   Available quantity: ${testEquipment.quantity}`)

    // Step 4: Create a booking
    console.log(`\nStep 4: Creating booking...`)
    const booking = await createBooking({
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhone: '555-1234',
      pickupDate,
      returnDate,
      equipmentIds: [testEquipmentId],
      totalPrice: testEquipment.dayRate * 2, // 2 days
      deposit: testEquipment.dayRate * 0.5,
      deliveryOption: 'WarehousePickup',
    })

    console.log(`✅ Booking created:`)
    console.log(`   - Booking ID: ${booking.id}`)
    console.log(`   - Status: ${booking.status}`)
    console.log(`   - Total Price: $${booking.totalPrice}`)

    // Step 5: Check availability after creating booking (should still be available since it's Pending)
    console.log(`\nStep 5: Checking availability after creating PENDING booking...`)
    const availabilityAfterPending = await checkAvailability(pickupDate, returnDate, [testEquipmentId])
    console.log(`   Equipment ${testEquipment.name}: ${availabilityAfterPending[testEquipmentId] ? '✅ Available' : '❌ Not Available'}`)
    console.log(`   (Should still be available because booking is Pending)`)

    // Step 6: Confirm the booking
    console.log(`\nStep 6: Confirming booking...`)
    const confirmedBooking = await confirmBooking(booking.id)
    console.log(`✅ Booking confirmed:`)
    console.log(`   - Booking ID: ${confirmedBooking.id}`)
    console.log(`   - Status: ${confirmedBooking.status}`)

    // Step 7: Check availability after confirmation (should NOT be available)
    console.log(`\nStep 7: Checking availability after CONFIRMING booking...`)
    const availabilityAfterConfirmed = await checkAvailability(pickupDate, returnDate, [testEquipmentId])
    const isAvailable = availabilityAfterConfirmed[testEquipmentId]
    console.log(`   Equipment ${testEquipment.name}: ${isAvailable ? '✅ Available' : '❌ Not Available'}`)

    if (!isAvailable) {
      console.log(`\n✅ TEST PASSED: Equipment is correctly marked as unavailable after confirmation!`)
    } else {
      console.log(`\n❌ TEST FAILED: Equipment is still showing as available after confirmation!`)
      console.log(`   This means the availability check is not working correctly.`)
    }

    // Step 8: Check calendar
    console.log(`\nStep 8: Checking calendar for confirmed bookings...`)
    const calendarBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['Confirmed', 'Active', 'Completed'] },
        pickupDate: { lte: dayAfterTomorrow },
        returnDate: { gte: tomorrow },
      },
      include: {
        package: true,
        bookingItems: {
          include: {
            equipment: true,
          },
        },
      },
    })

    console.log(`   Found ${calendarBookings.length} confirmed/active bookings in date range:`)
    calendarBookings.forEach((calBooking) => {
      console.log(`   - Booking ${calBooking.id.slice(0, 8)}: ${calBooking.status}`)
      console.log(`     Dates: ${calBooking.pickupDate.toISOString()} to ${calBooking.returnDate.toISOString()}`)
    })

    if (calendarBookings.length > 0 && calendarBookings[0].status === 'Confirmed') {
      console.log(`\n✅ TEST PASSED: Confirmed booking appears in calendar!`)
    } else {
      console.log(`\n❌ TEST FAILED: Confirmed booking not found in calendar!`)
    }

    console.log(`\n🎉 Test completed!`)
    console.log(`\nNote: The test booking is still in the database.`)
    console.log(`Run 'npm run db:clear-bookings' to clean it up.`)

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

async function confirmBooking(bookingId: string) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'Confirmed' },
  })
  return booking
}

async function checkAvailability(
  pickupDate: string,
  returnDate: string,
  equipmentIds: string[]
): Promise<Record<string, boolean>> {
  const pickup = new Date(pickupDate)
  const returnD = new Date(returnDate)

  const availability: Record<string, boolean> = {}

  for (const equipmentId of equipmentIds) {
    // Find all bookings that overlap with the requested dates
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ['Confirmed', 'Active'],
        },
        AND: [
          {
            pickupDate: { lte: returnD },
          },
          {
            returnDate: { gte: pickup },
          },
        ],
      },
      include: {
        bookingItems: {
          where: {
            equipmentId: equipmentId,
          },
        },
      },
    })

    // Count total booked quantity
    const bookedQuantity = overlappingBookings.reduce(
      (sum, booking) =>
        sum +
        booking.bookingItems.reduce(
          (itemSum, item) => itemSum + item.quantity,
          0
        ),
      0
    )

    // Get equipment details
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    })

    if (!equipment) {
      availability[equipmentId] = false
      continue
    }

    // Check if available
    availability[equipmentId] = equipment.quantity - bookedQuantity > 0
  }

  return availability
}

testBookingFlow()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

