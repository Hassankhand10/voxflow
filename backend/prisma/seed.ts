import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@voxflow.app' },
    update: { name: 'Hassan Khan' },
    create: {
      name: 'Hassan Khan',
      email: 'demo@voxflow.app',
      passwordHash,
      memberships: {
        create: {
          role: 'OWNER',
          workspace: {
            create: {
              name: 'Voxflow',
              slug: 'voxflow',
            },
          },
        },
      },
    },
    include: {
      memberships: { include: { workspace: true } },
    },
  });

  const workspaceId = user.memberships[0]?.workspaceId;
  if (!workspaceId) {
    throw new Error('Demo user has no workspace. Run: npx prisma migrate reset');
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name: 'Voxflow' },
  });

  const flow = await prisma.flow.upsert({
    where: { slug: 'senior-react-dev' },
    update: {},
    create: {
      name: 'Senior React Developer',
      description: 'Async video interview for senior React roles',
      slug: 'senior-react-dev',
      status: 'PUBLISHED',
      workspaceId,
      questions: {
        create: [
          {
            title: 'Tell us about your React experience.',
            type: 'VIDEO',
            order: 0,
            timeLimit: 120,
            required: true,
            aiFollowUp: true,
            placeholder: 'Record a short introduction...',
          },
          {
            title: 'Describe your most challenging project.',
            type: 'VIDEO',
            order: 1,
            timeLimit: 180,
            required: true,
            aiFollowUp: true,
          },
          {
            title: 'When can you start?',
            type: 'TEXT',
            order: 2,
            required: false,
            aiFollowUp: false,
            placeholder: 'Optional...',
          },
          {
            title: 'Thank you!',
            type: 'TEXT',
            order: 3,
            required: false,
            aiFollowUp: false,
            isThankYou: true,
          },
        ],
      },
    },
    include: { questions: true },
  });

  const salesFlow = await prisma.flow.upsert({
    where: { slug: 'sales-qualification' },
    update: {},
    create: {
      name: 'Sales Qualification',
      slug: 'sales-qualification',
      status: 'PUBLISHED',
      workspaceId,
      questions: {
        create: [
          {
            title: 'What is your company size?',
            type: 'MULTIPLE_CHOICE',
            order: 0,
            required: true,
            options: ['1-10', '11-50', '51-200', '200+'],
          },
          {
            title: 'Tell us about your needs.',
            type: 'VIDEO',
            order: 1,
            timeLimit: 120,
            required: true,
            aiFollowUp: false,
          },
          {
            title: 'Thank you!',
            type: 'TEXT',
            order: 2,
            isThankYou: true,
            required: false,
            aiFollowUp: false,
          },
        ],
      },
    },
  });

  let response1 = await prisma.response.findFirst({
    where: {
      respondentEmail: 'ali@email.com',
      flowId: flow.id,
    },
  });

  if (!response1) {
    response1 = await prisma.response.create({
      data: {
        flowId: flow.id,
        respondentName: 'Ali Raza',
        respondentEmail: 'ali@email.com',
        status: 'COMPLETED',
        duration: 272,
        submittedAt: new Date(),
        transcript:
          'I have about 5 years of experience with React. Currently working remotely at a fintech startup where I lead a team of 3 frontend developers. The most challenging project was rebuilding our trading dashboard.',
        aiSummary:
          '• 5 years React experience with team leadership\n• Currently remote at fintech startup\n• Led trading dashboard rebuild\n• Interested in full-stack development',
        aiTags: ['React', 'Node.js', 'Leadership', 'Remote', 'Full Stack'],
        aiScore: 87,
        notes: 'Strong candidate. Schedule technical round.',
        answers: {
          create: flow.questions
            .filter((q) => !q.isThankYou)
            .map((q) => ({
              questionId: q.id,
              textValue:
                q.order === 0
                  ? 'I have 5 years of React experience working remotely.'
                  : q.order === 1
                    ? 'Rebuilt a real-time trading dashboard with 60fps performance.'
                    : 'Available in 2 weeks.',
              duration: q.type === 'VIDEO' ? 90 : undefined,
            })),
        },
        comments: {
          create: {
            content: 'Great communication skills. Let us move forward.',
            userId: user.id,
          },
        },
      },
    });
  }

  const marcusExists = await prisma.response.findFirst({
    where: {
      respondentEmail: 'sana@email.com',
      flowId: salesFlow.id,
    },
  });

  if (!marcusExists) {
    await prisma.response.create({
      data: {
        flowId: salesFlow.id,
        respondentName: 'Sana Malik',
        respondentEmail: 'sana@email.com',
        status: 'PROCESSING',
        duration: 135,
        submittedAt: new Date(),
      },
    });
  }


  console.log('✅ Seed complete!');
  console.log('');
  console.log('Demo login:');
  console.log('  Email:    demo@voxflow.app');
  console.log('  Password: password123');
  console.log('');
  console.log(`Public flow: http://localhost:3000/f/${flow.slug}`);
  console.log(`Response ID: ${response1.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
