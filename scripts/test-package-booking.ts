import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPackageBookingFlow() {
  try {
    console.log('🧪 Starting Package Booking Flow Test...\n')

    // Step 1: Get available packages
    console.log('Step 1: Fetching available packages...')
    const packages = await prisma.package.findMany({
      take: 1,
    })

    if (packages.length === 0) {
      console.error('❌ No packages found. Please seed the database first.')
      return
    }

    const testPackage = packages[0]
    console.log(`✅ Found package: ${testPackage.name}`)
    console.log(`   - ID: ${testPackage.id}`)
    console.log(`   - Base Price: $${testPackage.basePrice}`)
    console.log(`   - Ideal For: ${testPackage.idealFor}`)

    // Step 2: Get package equipment IDs
    const packageEquipmentIds = JSON.parse(testPackage.keyEquipment || '[]')
    console.log(`\nStep 2: Package includes ${packageEquipmentIds.length} equipment items`)

    // Step 3: Set up test dates (tomorrow to day after tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
    dayAfterTomorrow.setHours(18, 0, 0, 0)

    const pickupDate = tomorrow.toISOString()
    const returnDate = dayAfterTomorrow.toISOString()

    console.log(`\nStep 3: Test dates:`)
    console.log(`   - Pickup: ${pickupDate}`)
    console.log(`   - Return: ${returnDate}`)

    // Step 4: Check initial availability for package equipment
    console.log(`\nStep 4: Checking initial availability for package equipment...`)
    const initialAvailability = await checkAvailability(pickupDate, returnDate, packageEquipmentIds)
    const allAvailable = Object.values(initialAvailability).every(avail => avail === true)
    console.log(`   All equipment available: ${allAvailable ? '✅ Yes' : '❌ No'}`)
    Object.entries(initialAvailability).forEach(([equipmentId, isAvailable]) => {
      const equipment = prisma.equipment.findUnique({ where: { id: equipmentId } }).then(eq => {
        if (eq) {
          console.log(`   - ${eq.name}: ${isAvailable ? '✅ Available' : '❌ Not Available'}`)
        }
      })
    })

    // Step 5: Create a package booking
    console.log(`\nStep 5: Creating package booking...`)
    const booking = await createPackageBooking({
      customerName: 'Test Package User',
      customerEmail: 'testpackage@example.com',
      customerPhone: '555-5678',
      packageId: testPackage.id,
      pickupDate,
      returnDate,
      totalPrice: testPackage.basePrice * 2, // 2 days
      deposit: testPackage.basePrice * 0.5,
      deliveryOption: 'WarehousePickup',
    })

    console.log(`✅ Package booking created:`)
    console.log(`   - Booking ID: ${booking.id}`)
    console.log(`   - Status: ${booking.status}`)
    console.log(`   - Package: ${testPackage.name}`)
    console.log(`   - Total Price: $${booking.totalPrice}`)

    // Step 6: Check availability after creating PENDING booking (should still be available)
    console.log(`\nStep 6: Checking availability after creating PENDING booking...`)
    const availabilityAfterPending = await checkAvailability(pickupDate, returnDate, packageEquipmentIds)
    const stillAvailable = Object.values(availabilityAfterPending).every(avail => avail === true)
    console.log(`   All equipment still available: ${stillAvailable ? '✅ Yes' : '❌ No'}`)
    console.log(`   (Should still be available because booking is Pending)`)

    // Step 7: Check calendar before confirmation
    console.log(`\nStep 7: Checking calendar for PENDING booking...`)
    const calendarBeforeConfirm = await getCalendarBookings()
    const pendingInCalendar = calendarBeforeConfirm.some(b => b.id === booking.id)
    console.log(`   Pending booking in calendar: ${pendingInCalendar ? '✅ Yes' : '❌ No'}`)
    console.log(`   (Should NOT be in calendar because it's Pending, not Confirmed)`)

    // Step 8: Confirm the booking
    console.log(`\nStep 8: Confirming package booking...`)
    const confirmedBooking = await confirmBooking(booking.id)
    console.log(`✅ Booking confirmed:`)
    console.log(`   - Booking ID: ${confirmedBooking.id}`)
    console.log(`   - Status: ${confirmedBooking.status}`)

    // Step 9: Check availability after confirmation (should NOT be available)
    console.log(`\nStep 9: Checking availability after CONFIRMING booking...`)
    // Wait a moment for database to update
    await new Promise(resolve => setTimeout(resolve, 500))
    const availabilityAfterConfirmed = await checkAvailability(pickupDate, returnDate, packageEquipmentIds)
    const nowUnavailable = Object.values(availabilityAfterConfirmed).some(avail => avail === false)
    console.log(`   Equipment now unavailable: ${nowUnavailable ? '✅ Yes' : '❌ No'}`)

    if (nowUnavailable) {
      console.log(`\n✅ TEST PASSED: Equipment is correctly marked as unavailable after confirmation!`)
    } else {
      console.log(`\n❌ TEST FAILED: Equipment is still showing as available after confirmation!`)
    }

    // Step 10: Check calendar after confirmation
    console.log(`\nStep 10: Checking calendar for CONFIRMED booking...`)
    // Wait a moment for database to update
    await new Promise(resolve => setTimeout(resolve, 500))
    const calendarAfterConfirm = await getCalendarBookings()
    const confirmedInCalendar = calendarAfterConfirm.find(b => b.id === booking.id)

    if (confirmedInCalendar) {
      console.log(`✅ TEST PASSED: Confirmed package booking appears in calendar!`)
      console.log(`   - Booking ID: ${confirmedInCalendar.id.slice(0, 8)}`)
      console.log(`   - Status: ${confirmedInCalendar.status}`)
      console.log(`   - Package: ${confirmedInCalendar.package?.name || 'N/A'}`)
      console.log(`   - Pickup Date: ${new Date(confirmedInCalendar.pickupDate).toISOString()}`)
      console.log(`   - Return Date: ${new Date(confirmedInCalendar.returnDate).toISOString()}`)
    } else {
      console.log(`❌ TEST FAILED: Confirmed package booking NOT found in calendar!`)
      console.log(`   Calendar shows ${calendarAfterConfirm.length} bookings:`)
      calendarAfterConfirm.forEach((calBooking) => {
        console.log(`   - Booking ${calBooking.id.slice(0, 8)}: ${calBooking.status} (Package: ${calBooking.package?.name || 'None'})`)
      })
    }

    // Step 11: Verify calendar shows correct dates
    if (confirmedInCalendar) {
      console.log(`\nStep 11: Verifying calendar date grouping...`)
      const pickupDateStr = new Date(confirmedInCalendar.pickupDate).toISOString().split('T')[0]
      const returnDateStr = new Date(confirmedInCalendar.returnDate).toISOString().split('T')[0]
      console.log(`   - Pickup date: ${pickupDateStr}`)
      console.log(`   - Return date: ${returnDateStr}`)
      console.log(`   ✅ Calendar should show this booking on both pickup and return dates`)
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

async function createPackageBooking(data: {
  customerName: string
  customerEmail: string
  customerPhone: string
  packageId: string
  pickupDate: string
  returnDate: string
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

  // Create booking with package
  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      packageId: data.packageId,
      pickupDate: new Date(data.pickupDate),
      returnDate: new Date(data.returnDate),
      totalPrice: data.totalPrice,
      deposit: data.deposit,
      status: 'Pending',
      deliveryOption: data.deliveryOption,
    },
  })

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

async function getCalendarBookings() {
  // Get all confirmed, active, and completed bookings (same as calendar API)
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ['Confirmed', 'Active', 'Completed'] },
    },
    include: {
      package: true,
      bookingItems: {
        include: {
          equipment: true,
        },
      },
    },
    orderBy: { pickupDate: 'asc' },
  })

  return bookings
}

testPackageBookingFlow()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

