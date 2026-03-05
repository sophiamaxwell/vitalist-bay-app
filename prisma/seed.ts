import { PrismaClient, SessionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data
  await prisma.personalAgendaItem.deleteMany()
  await prisma.sessionSpeaker.deleteMany()
  await prisma.eventSession.deleteMany()
  await prisma.speaker.deleteMany()
  await prisma.track.deleteMany()
  await prisma.room.deleteMany()
  await prisma.event.deleteMany()

  // Create Event
  const event = await prisma.event.create({
    data: {
      slug: 'vitalist-bay-2026',
      name: 'Vitalist Bay 2026',
      description: 'The premier longevity science conference bringing together researchers, entrepreneurs, and enthusiasts.',
      startDate: new Date('2026-04-03T09:00:00'),
      endDate: new Date('2026-04-05T18:00:00'),
      timezone: 'America/Los_Angeles',
      format: 'IN_PERSON',
      venue: 'The Innovation Hub',
      city: 'San Francisco',
      country: 'USA',
      primaryColor: '#10b981',
      isPublished: true,
      registrationOpen: true,
    },
  })

  console.log('✅ Created event:', event.name)

  // Create Tracks
  const tracks = await Promise.all([
    prisma.track.create({
      data: {
        eventId: event.id,
        name: 'Science',
        color: '#3b82f6',
        sortOrder: 0,
      },
    }),
    prisma.track.create({
      data: {
        eventId: event.id,
        name: 'Technology',
        color: '#8b5cf6',
        sortOrder: 1,
      },
    }),
    prisma.track.create({
      data: {
        eventId: event.id,
        name: 'Wellness',
        color: '#10b981',
        sortOrder: 2,
      },
    }),
    prisma.track.create({
      data: {
        eventId: event.id,
        name: 'Business',
        color: '#f59e0b',
        sortOrder: 3,
      },
    }),
  ])

  console.log('✅ Created tracks:', tracks.length)

  // Create Rooms
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        eventId: event.id,
        name: 'Main Hall',
        capacity: 500,
        floor: 'Ground Floor',
        sortOrder: 0,
      },
    }),
    prisma.room.create({
      data: {
        eventId: event.id,
        name: 'Workshop Room A',
        capacity: 50,
        floor: '1st Floor',
        sortOrder: 1,
      },
    }),
    prisma.room.create({
      data: {
        eventId: event.id,
        name: 'Workshop Room B',
        capacity: 50,
        floor: '1st Floor',
        sortOrder: 2,
      },
    }),
    prisma.room.create({
      data: {
        eventId: event.id,
        name: 'Networking Lounge',
        capacity: 100,
        floor: 'Ground Floor',
        sortOrder: 3,
      },
    }),
  ])

  console.log('✅ Created rooms:', rooms.length)

  // Create Speakers
  const speakers = await Promise.all([
    prisma.speaker.create({
      data: {
        eventId: event.id,
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@longevityinstitute.org',
        bio: 'Leading researcher in cellular senescence and rejuvenation therapies.',
        company: 'Longevity Research Institute',
        jobTitle: 'Director of Research',
        linkedin: 'https://linkedin.com/in/sarahchen',
        featured: true,
        sortOrder: 0,
      },
    }),
    prisma.speaker.create({
      data: {
        eventId: event.id,
        name: 'Marcus Williams',
        email: 'marcus@biotech.vc',
        bio: 'Serial entrepreneur and investor focused on longevity startups.',
        company: 'BioTech Ventures',
        jobTitle: 'Managing Partner',
        twitter: 'https://twitter.com/marcuswilliams',
        featured: true,
        sortOrder: 1,
      },
    }),
    prisma.speaker.create({
      data: {
        eventId: event.id,
        name: 'Dr. Aiko Tanaka',
        email: 'tanaka@japanlongevity.jp',
        bio: 'Expert in blue zones research and lifestyle interventions.',
        company: 'Japan Longevity Center',
        jobTitle: 'Chief Science Officer',
        featured: true,
        sortOrder: 2,
      },
    }),
    prisma.speaker.create({
      data: {
        eventId: event.id,
        name: 'James Rodriguez',
        email: 'james@healthspan.io',
        bio: 'AI/ML specialist applying machine learning to aging research.',
        company: 'HealthSpan AI',
        jobTitle: 'CTO',
        sortOrder: 3,
      },
    }),
    prisma.speaker.create({
      data: {
        eventId: event.id,
        name: 'Dr. Elena Kowalski',
        email: 'elena@geroscience.org',
        bio: 'Pioneer in epigenetic clock research and biological age measurement.',
        company: 'GeroScience Foundation',
        jobTitle: 'Research Fellow',
        sortOrder: 4,
      },
    }),
  ])

  console.log('✅ Created speakers:', speakers.length)

  // Create Sessions
  const sessions = await Promise.all([
    // Day 1 - April 3rd
    prisma.eventSession.create({
      data: {
        eventId: event.id,
        trackId: null,
        roomId: rooms[0].id,
        title: 'Opening Keynote: The Future of Longevity',
        description: 'Join us for an inspiring opening keynote exploring the current state and future of longevity science.',
        startTime: new Date('2026-04-03T09:00:00'),
        endTime: new Date('2026-04-03T10:00:00'),
        type: 'KEYNOTE',
        capacity: 500,
        isPublished: true,
        speakers: {
          create: [
            { speakerId: speakers[0].id, role: 'Keynote Speaker', sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.eventSession.create({
      data: {
        eventId: event.id,
        trackId: tracks[0].id,
        roomId: rooms[0].id,
        title: 'Cellular Senescence: Latest Discoveries',
        description: 'An in-depth look at recent breakthroughs in understanding and targeting cellular senescence.',
        startTime: new Date('2026-04-03T10:30:00'),
        endTime: new Date('2026-04-03T11:30:00'),
        type: 'TALK',
        capacity: 500,
        isPublished: true,
        speakers: {
          create: [
            { speakerId: speakers[0].id, role: 'Speaker', sortOrder: 0 },
            { speakerId: speakers[4].id, role: 'Co-Speaker', sortOrder: 1 },
          ],
        },
      },
    }),
    prisma.eventSession.create({
      data: {
        eventId: event.id,
        trackId: tracks[1].id,
        roomId: rooms[1].id,
        title: 'AI in Aging Research',
        description: 'How artificial intelligence is accelerating discoveries in longevity science.',
        startTime: new Date('2026-04-03T10:30:00'),
        endTime: new Date('2026-04-03T11:30:00'),
        type: 'WORKSHOP',
        capacity: 50,
        isPublished: true,
        speakers: {
          create: [
            { speakerId: speakers[3].id, role: 'Workshop Lead', sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.eventSession.create({
      data: {
        eventId: event.id,
        roomId: rooms[3].id,
        title: 'Networking Lunch',
        description: 'Connect with fellow attendees over lunch.',
        startTime: new Date('2026-04-03T12:00:00'),
        endTime: new Date('2026-04-03T13:30:00'),
        type: 'NETWORKING',
        capacity: 100,
        isPublished: true,
      },
    }),
    prisma.eventSession.create({
      data: {
        eventId: event.id,
        trackId: tracks[2].id,
        roomId: rooms[0].id,
        title: 'Blue Zones: Lessons for Longevity',
        description: 'Exploring lifestyle factors from the world\'s longest-lived communities.',
        startTime: new Date('2026-04-03T14:00:00'),
        endTime: new Date('2026-04-03T15:00:00'),
        type: 'TALK',
        capacity: 500,
        isPublished: true,
        speakers: {
          create: [
            { speakerId: speakers[2].id, role: 'Speaker', sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.eventSession.create({
      data: {
        eventId: event.id,
        trackId: tracks[3].id,
        roomId: rooms[0].id,
        title: 'Investing in Longevity',
        description: 'Panel discussion on the longevity investment landscape.',
        startTime: new Date('2026-04-03T15:30:00'),
        endTime: new Date('2026-04-03T16:30:00'),
        type: 'PANEL',
        capacity: 500,
        isPublished: true,
        speakers: {
          create: [
            { speakerId: speakers[1].id, role: 'Moderator', sortOrder: 0 },
          ],
        },
      },
    }),
    // Day 2 - April 4th
    prisma.eventSession.create({
      data: {
        eventId: event.id,
        trackId: tracks[0].id,
        roomId: rooms[0].id,
        title: 'Epigenetic Clocks: Measuring Biological Age',
        description: 'Understanding and applying epigenetic age measurements.',
        startTime: new Date('2026-04-04T09:00:00'),
        endTime: new Date('2026-04-04T10:00:00'),
        type: 'TALK',
        capacity: 500,
        isPublished: true,
        speakers: {
          create: [
            { speakerId: speakers[4].id, role: 'Speaker', sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.eventSession.create({
      data: {
        eventId: event.id,
        trackId: tracks[1].id,
        roomId: rooms[1].id,
        title: 'Building Longevity Startups',
        description: 'Workshop on founding and scaling companies in the longevity space.',
        startTime: new Date('2026-04-04T10:30:00'),
        endTime: new Date('2026-04-04T12:00:00'),
        type: 'WORKSHOP',
        capacity: 50,
        isPublished: true,
        speakers: {
          create: [
            { speakerId: speakers[1].id, role: 'Workshop Lead', sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.eventSession.create({
      data: {
        eventId: event.id,
        roomId: null,
        title: 'Afternoon Break',
        description: 'Refreshments and informal networking.',
        startTime: new Date('2026-04-04T15:00:00'),
        endTime: new Date('2026-04-04T15:30:00'),
        type: 'BREAK',
        isPublished: true,
      },
    }),
    prisma.eventSession.create({
      data: {
        eventId: event.id,
        trackId: tracks[2].id,
        roomId: rooms[2].id,
        title: 'Practical Longevity Protocols',
        description: 'Evidence-based lifestyle interventions for healthspan.',
        startTime: new Date('2026-04-04T15:30:00'),
        endTime: new Date('2026-04-04T17:00:00'),
        type: 'WORKSHOP',
        capacity: 50,
        isPublished: true,
        speakers: {
          create: [
            { speakerId: speakers[2].id, role: 'Workshop Lead', sortOrder: 0 },
          ],
        },
      },
    }),
  ])

  console.log('✅ Created sessions:', sessions.length)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
