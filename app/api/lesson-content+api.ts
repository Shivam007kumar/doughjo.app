export async function GET(request: Request) {
  const url = new URL(request.url);
  const contentId = url.searchParams.get('id');
  const type = url.searchParams.get('type'); // 'question', 'translation', 'exercise'

  try {
    if (contentId) {
      const content = await getContentById(contentId);
      if (!content) {
        return new Response('Content not found', { status: 404 });
      }
      return Response.json(content);
    }

    // Get content by type
    const content = await getContentByType(type);
    return Response.json(content);
  } catch (error) {
    console.error('Error fetching lesson content:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentData = await request.json();
    const newContent = await createContent(contentData);
    return Response.json(newContent, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return new Response('Failed to create content', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const contentId = url.searchParams.get('id');
    
    if (!contentId) {
      return new Response('Content ID required', { status: 400 });
    }

    const updateData = await request.json();
    const updatedContent = await updateContent(contentId, updateData);
    
    if (!updatedContent) {
      return new Response('Content not found', { status: 404 });
    }
    
    return Response.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    return new Response('Failed to update content', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const contentId = url.searchParams.get('id');
    
    if (!contentId) {
      return new Response('Content ID required', { status: 400 });
    }

    const deleted = await deleteContent(contentId);
    
    if (!deleted) {
      return new Response('Content not found', { status: 404 });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return new Response('Failed to delete content', { status: 500 });
  }
}

// Mock database functions - replace with actual database calls
async function getContentById(id: string) {
  const allContent = await getAllContent();
  return allContent.find(content => content.id === id);
}

async function getContentByType(type: string | null) {
  const allContent = await getAllContent();
  if (!type) return allContent;
  
  return allContent.filter(content => content.type === type);
}

async function createContent(contentData: any) {
  const newContent = {
    id: generateId(),
    ...contentData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return newContent;
}

async function updateContent(id: string, updateData: any) {
  const content = await getContentById(id);
  if (!content) return null;
  
  return {
    ...content,
    ...updateData,
    updatedAt: new Date().toISOString()
  };
}

async function deleteContent(id: string) {
  const content = await getContentById(id);
  return !!content; // Return true if content existed
}

async function getAllContent() {
  // Mock content data - replace with database query
  return [
    {
      id: 'q1',
      type: 'question',
      category: 'Finance',
      difficulty: 'easy',
      question: 'What is the recommended emergency fund size?',
      options: ['1-2 months of expenses', '3-6 months of expenses', '7-9 months of expenses', '10+ months of expenses'],
      correctAnswer: 1,
      explanation: 'Financial experts recommend saving 3-6 months of living expenses for emergencies.',
      tags: ['emergency-fund', 'savings', 'financial-planning'],
      metadata: {
        estimatedTime: 30, // seconds
        points: 10,
        source: 'Financial Planning 101'
      }
    },
    {
      id: 't1',
      type: 'translation',
      category: 'Finance',
      difficulty: 'easy',
      from: 'Budget',
      to: 'A plan for how you will spend your money',
      alternatives: ['Financial plan', 'Spending plan', 'Money plan'],
      context: 'Personal finance management',
      tags: ['budgeting', 'planning'],
      metadata: {
        estimatedTime: 20,
        points: 5,
        language: 'en'
      }
    },
    {
      id: 'e1',
      type: 'exercise',
      category: 'Finance',
      difficulty: 'medium',
      title: 'Create a Monthly Budget',
      description: 'Practice creating a budget with the given income and expenses',
      scenario: {
        income: 3000,
        fixedExpenses: {
          rent: 1000,
          utilities: 200,
          insurance: 150
        },
        variableExpenses: {
          groceries: 400,
          transportation: 300,
          entertainment: 200
        }
      },
      tasks: [
        'Calculate total fixed expenses',
        'Calculate total variable expenses',
        'Determine remaining income for savings',
        'Suggest budget adjustments if needed'
      ],
      solution: {
        totalFixed: 1350,
        totalVariable: 900,
        remainingForSavings: 750,
        savingsPercentage: 25
      },
      tags: ['budgeting', 'calculation', 'planning'],
      metadata: {
        estimatedTime: 300, // 5 minutes
        points: 25
      }
    }
  ];
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}