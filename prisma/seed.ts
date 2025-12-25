import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const passwordHash = await bcrypt.hash(adminPassword, 10)
  
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@sonicrentals.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@sonicrentals.com',
      name: 'Admin User',
      passwordHash,
      role: 'admin',
    },
  })
  console.log('Created admin user:', admin.email)

  // Create sample equipment
  const equipmentData = [
      {
        name: 'JBL 10" EON Speaker',
        category: 'Speaker',
        specs: JSON.stringify({
          watts: 1000,
          audienceCapacity: 50,
          connectionTypes: ['XLR', '1/4"'],
        }),
        dayRate: 25.0,
        status: 'Active',
        quantity: 4,
      },
      {
        name: 'JBL 15" EON Speaker',
        category: 'Speaker',
        specs: JSON.stringify({
          watts: 1500,
          audienceCapacity: 100,
          connectionTypes: ['XLR', '1/4"'],
        }),
        dayRate: 35.0,
        status: 'Active',
        quantity: 4,
      },
      {
        name: 'Shure SM58 Microphone',
        category: 'Microphone',
        specs: JSON.stringify({
          type: 'Dynamic',
          connectionTypes: ['XLR'],
        }),
        dayRate: 10.0,
        status: 'Active',
        quantity: 8,
      },
      {
        name: 'Yamaha MG10XU Mixer',
        category: 'Mixer',
        specs: JSON.stringify({
          channels: 10,
          connectionTypes: ['XLR', '1/4"', 'USB'],
        }),
        dayRate: 40.0,
        status: 'Active',
        quantity: 2,
      },
      {
        name: 'Audio-Technica ATH-M50x Headphones',
        category: 'Headphones',
        specs: JSON.stringify({
          type: 'Over-ear',
          connectionTypes: ['1/4"', '3.5mm'],
        }),
        dayRate: 15.0,
        status: 'Active',
        quantity: 6,
      },
      {
        name: 'XLR Cable 25ft',
        category: 'Cable',
        specs: JSON.stringify({
          length: 25,
          connectionTypes: ['XLR'],
        }),
        dayRate: 5.0,
        status: 'Active',
        quantity: 20,
      },
    ]
  
  for (const item of equipmentData) {
    await prisma.equipment.upsert({
      where: { id: 'temp' },
      update: {},
      create: item,
    })
  }
  
  const equipment = await prisma.equipment.findMany()
  console.log(`Created ${equipment.length} equipment items`)

  // Get equipment IDs for packages
  const allEquipment = await prisma.equipment.findMany()
  const speaker10 = allEquipment.find(e => e.name.includes('10" EON'))
  const speaker15 = allEquipment.find(e => e.name.includes('15" EON'))
  const mic = allEquipment.find(e => e.name.includes('SM58'))
  const mixer = allEquipment.find(e => e.name.includes('MG10XU'))
  const headphones = allEquipment.find(e => e.name.includes('ATH-M50x'))
  const cable = allEquipment.find(e => e.name.includes('XLR Cable'))

  // Create packages
  const packageData = [
      {
        name: 'Backyard Bash',
        idealFor: 'Small backyard parties, intimate gatherings',
        crowdSize: '10-25 people',
        keyEquipment: JSON.stringify([
          speaker10?.id,
          mic?.id,
        ].filter(Boolean)),
        setupTime: 15,
        basePrice: 50.0,
      },
      {
        name: 'Toast & Tunes',
        idealFor: 'Weddings, corporate events, medium gatherings',
        crowdSize: '50-100 people',
        keyEquipment: JSON.stringify([
          speaker15?.id,
          speaker15?.id,
          mic?.id,
          mic?.id,
          mixer?.id,
        ].filter(Boolean)),
        setupTime: 30,
        basePrice: 150.0,
      },
      {
        name: 'Pop-up DJ',
        idealFor: 'DJ sets, dance parties, nightlife events',
        crowdSize: '75-150 people',
        keyEquipment: JSON.stringify([
          speaker15?.id,
          speaker15?.id,
          mixer?.id,
          headphones?.id,
        ].filter(Boolean)),
        setupTime: 45,
        basePrice: 200.0,
      },
      {
        name: 'Grand Event',
        idealFor: 'Large venues, festivals, major events',
        crowdSize: '200+ people',
        keyEquipment: JSON.stringify([
          speaker15?.id,
          speaker15?.id,
          speaker15?.id,
          speaker15?.id,
          mic?.id,
          mic?.id,
          mixer?.id,
          headphones?.id,
        ].filter(Boolean)),
        setupTime: 60,
        basePrice: 400.0,
      },
    ]
  
  for (const pkg of packageData) {
    await prisma.package.upsert({
      where: { id: 'temp' },
      update: {},
      create: pkg,
    })
  }
  
  const packages = await prisma.package.findMany()
  console.log(`Created ${packages.length} packages`)

  // Create add-ons
  const addonData = [
      {
        name: 'Lighting Package',
        category: 'Atmosphere',
        price: 50.0,
        description: 'Color-changing LED lights for ambiance',
      },
      {
        name: 'Wireless Microphone',
        category: 'Technical',
        price: 30.0,
        description: 'Wireless handheld microphone',
      },
      {
        name: 'Microphone Stand',
        category: 'Technical',
        price: 10.0,
        description: 'Adjustable microphone stand',
      },
      {
        name: 'Speaker Stands',
        category: 'Technical',
        price: 20.0,
        description: 'Pair of adjustable speaker stands',
      },
      {
        name: 'Professional Delivery',
        category: 'Premium',
        price: 100.0,
        description: 'White-glove delivery and setup service',
      },
      {
        name: 'On-Site Technician',
        category: 'Premium',
        price: 200.0,
        description: 'Dedicated technician for the duration of your event',
      },
      {
        name: 'Backup Equipment',
        category: 'Premium',
        price: 75.0,
        description: 'Backup equipment package for peace of mind',
      },
      {
        name: 'Extended Rental',
        category: 'Premium',
        price: 50.0,
        description: 'Additional 24 hours rental extension',
      },
      {
        name: 'Cable Package',
        category: 'Technical',
        price: 25.0,
        description: 'Assorted cables (XLR, 1/4", RCA)',
      },
    ]
  
  for (const addon of addonData) {
    await prisma.addOn.upsert({
      where: { id: 'temp' },
      update: {},
      create: addon,
    })
  }
  
  const addons = await prisma.addOn.findMany()
  console.log(`Created ${addons.length} add-ons`)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

