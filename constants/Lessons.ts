export const lessons = {
  budgetingBasics: [
    {
      id: 'budget-intro',
      title: 'Understanding Budgets',
      content: "A budget is your financial roadmap - it helps you track where your money comes from and where it goes. Think of it like a GPS for your money! By creating a budget, you'll gain control over your finances and make smarter spending decisions.",
      type: 'text',
    },
    {
      id: 'income-expenses',
      title: 'Income vs. Expenses',
      type: 'interactive',
      quiz: [
        {
          question: 'Which of these is considered income?',
          options: [
            'Monthly rent payment',
            'Part-time job paycheck',
            'Grocery shopping',
            'Phone bill'
          ],
          answer: 1
        },
        {
          question: 'What type of expense is a Netflix subscription?',
          options: [
            'Essential expense',
            'Want/discretionary expense',
            'Emergency expense',
            'Investment expense'
          ],
          answer: 1
        }
      ]
    },
    {
      id: 'fifty-thirty-twenty',
      title: 'The 50/30/20 Rule',
      type: 'interactive',
      quiz: [
        {
          question: 'In the 50/30/20 rule, what should 50% of your income go towards?',
          options: [
            'Wants and entertainment',
            'Savings and debt payment',
            'Needs and essential expenses',
            'Investments'
          ],
          answer: 2
        },
        {
          question: 'If you make $2000 per month, how much should go to savings according to the 50/30/20 rule?',
          options: [
            '$200',
            '$400',
            '$600',
            '$1000'
          ],
          answer: 1
        }
      ]
    },
    {
      id: 'tracking-expenses',
      title: 'Smart Expense Tracking',
      type: 'interactive',
      quiz: [
        {
          question: 'What\'s the best way to track daily expenses?',
          options: [
            'Keep receipts and review monthly',
            'Record expenses as they happen',
            'Wait until credit card statement',
            'Ask family to remember'
          ],
          answer: 1
        },
        {
          question: 'Which category typically has the most "surprise" expenses?',
          options: [
            'Fixed bills',
            'Groceries',
            'Entertainment',
            'Transportation'
          ],
          answer: 2
        }
      ]
    },
    {
      id: 'budget-challenge',
      title: 'Budget Challenge',
      type: 'challenge',
      scenario: {
        description: "You've got $1000 monthly income. Create a budget using the 50/30/20 rule.",
        initialAmount: 1000,
        categories: [
          {
            name: 'Needs',
            target: 500,
            items: ['Rent', 'Groceries', 'Transportation']
          },
          {
            name: 'Wants',
            target: 300,
            items: ['Entertainment', 'Dining out', 'Shopping']
          },
          {
            name: 'Savings',
            target: 200,
            items: ['Emergency fund', 'Future goals']
          }
        ]
      }
    }
  ],
  
  savingSensei: [
    {
      id: 'saving-1',
      title: 'Why Save Money?',
      content: 'Understand the importance of saving and how it creates financial security and opportunities.',
      type: 'text',
    },
    {
      id: 'saving-2',
      title: 'Emergency Funds 101',
      content: 'Learn why everyone needs an emergency fund and how to build one, even on a tight budget.',
      type: 'interactive',
      quiz: [
        {
          question: 'How many months of expenses should an ideal emergency fund cover?',
          options: ['1-2 months', '3-6 months', '7-9 months', '10-12 months'],
          answer: 1
        }
      ]
    },
    {
      id: 'saving-3',
      title: 'Saving vs. Investing',
      content: 'Understand the difference between saving and investing, and when to do each.',
      type: 'video',
    },
    {
      id: 'saving-4',
      title: 'Automating Your Savings',
      content: 'Discover how to set up automatic transfers to make saving effortless and consistent.',
      type: 'text',
    },
    {
      id: 'saving-5',
      title: 'Savings Challenge',
      content: 'Take on this challenge to boost your savings rate over the next month!',
      type: 'challenge',
      scenario: 'Find three ways to reduce your monthly expenses and redirect that money to savings.',
    }
  ],
  
  creditCardMaster: [
    {
      id: 'credit-1',
      title: 'Credit Cards Explained',
      content: 'Learn how credit cards work and the important terms you need to know.',
      type: 'text',
    },
    {
      id: 'credit-2',
      title: 'Building Credit Responsibly',
      content: 'Discover strategies to build and maintain good credit using credit cards.',
      type: 'video',
    },
    {
      id: 'credit-3',
      title: 'Interest and Fees',
      content: 'Understand how credit card interest works and how to avoid costly fees.',
      type: 'interactive',
      quiz: [
        {
          question: 'What happens if you only pay the minimum payment on your credit card?',
          options: [
            'Nothing, that\'s all you need to pay', 
            'You\'ll pay off your balance faster', 
            'You\'ll avoid interest charges', 
            'You\'ll accumulate interest on the remaining balance'
          ],
          answer: 3
        }
      ]
    },
    {
      id: 'credit-4',
      title: 'Credit Card Rewards',
      content: 'Learn how to maximize credit card rewards without falling into debt traps.',
      type: 'text',
    },
    {
      id: 'credit-5',
      title: 'Credit Card Challenge',
      content: 'Put your credit card knowledge to the test!',
      type: 'challenge',
      scenario: 'Review a sample credit card statement and identify potential issues or savings opportunities.',
    }
  ]
};