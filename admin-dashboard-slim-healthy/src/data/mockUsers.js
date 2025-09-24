// Mock data for testing the users list screen
export const mockUsers = [
  {
    id: '507f1f77bcf86cd799439011',
    email: 'user1@example.com',
    name: 'John Doe',
    isAdmin: false,
    createdAt: '2023-06-28T10:30:00.000Z',
    lastLoginAt: '2023-06-30T15:45:22.000Z',
    onboardingCompleted: true,
    onboardingStep: 6,
    profileCompleteness: 100,
  },
  {
    id: '507f1f77bcf86cd799439012',
    email: 'user2@example.com',
    name: 'Jane Smith',
    isAdmin: false,
    createdAt: '2023-06-29T11:20:00.000Z',
    lastLoginAt: '2023-06-30T09:15:30.000Z',
    onboardingCompleted: false,
    onboardingStep: 3,
    profileCompleteness: 60,
  },
  {
    id: '507f1f77bcf86cd799439013',
    email: 'user3@example.com',
    name: 'Robert Johnson',
    isAdmin: true,
    createdAt: '2023-06-27T08:15:00.000Z',
    lastLoginAt: '2023-06-30T14:20:10.000Z',
    onboardingCompleted: true,
    onboardingStep: 6,
    profileCompleteness: 95,
  },
  {
    id: '507f1f77bcf86cd799439014',
    email: 'user4@example.com',
    name: 'Emily Davis',
    isAdmin: false,
    createdAt: '2023-06-26T15:45:00.000Z',
    lastLoginAt: '2023-06-29T11:30:45.000Z',
    onboardingCompleted: false,
    onboardingStep: 2,
    profileCompleteness: 30,
  },
  {
    id: '507f1f77bcf86cd799439015',
    email: 'user5@example.com',
    name: 'Michael Brown',
    isAdmin: false,
    createdAt: '2023-06-25T09:10:00.000Z',
    lastLoginAt: '2023-06-28T16:50:15.000Z',
    onboardingCompleted: true,
    onboardingStep: 6,
    profileCompleteness: 100,
  },
  {
    id: '507f1f77bcf86cd799439016',
    email: 'user6@example.com',
    name: 'Sarah Wilson',
    isAdmin: false,
    createdAt: '2023-06-24T14:25:00.000Z',
    lastLoginAt: '2023-06-27T10:05:30.000Z',
    onboardingCompleted: false,
    onboardingStep: 4,
    profileCompleteness: 75,
  },
  {
    id: '507f1f77bcf86cd799439017',
    email: 'user7@example.com',
    name: 'David Taylor',
    isAdmin: false,
    createdAt: '2023-06-23T11:40:00.000Z',
    lastLoginAt: '2023-06-26T13:20:45.000Z',
    onboardingCompleted: true,
    onboardingStep: 6,
    profileCompleteness: 90,
  },
  {
    id: '507f1f77bcf86cd799439018',
    email: 'user8@example.com',
    name: 'Jennifer Martinez',
    isAdmin: false,
    createdAt: '2023-06-22T16:55:00.000Z',
    lastLoginAt: '2023-06-25T09:35:10.000Z',
    onboardingCompleted: false,
    onboardingStep: 1,
    profileCompleteness: 10,
  },
  {
    id: '507f1f77bcf86cd799439019',
    email: 'user9@example.com',
    name: 'James Anderson',
    isAdmin: false,
    createdAt: '2023-06-21T13:15:00.000Z',
    lastLoginAt: '2023-06-24T15:50:25.000Z',
    onboardingCompleted: true,
    onboardingStep: 6,
    profileCompleteness: 85,
  },
  {
    id: '507f1f77bcf86cd799439020',
    email: 'user10@example.com',
    name: 'Patricia Thomas',
    isAdmin: false,
    createdAt: '2023-06-20T08:30:00.000Z',
    lastLoginAt: '2023-06-23T12:10:40.000Z',
    onboardingCompleted: false,
    onboardingStep: 5,
    profileCompleteness: 80,
  },
];

export const getMockUsers = (
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  order = 'desc',
  search = ''
) => {
  let filteredUsers = [...mockUsers];

  // Apply search if provided
  if (search.trim() !== '') {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  filteredUsers.sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];

    // Handle date fields
    if (sortBy === 'createdAt' || sortBy === 'lastLoginAt') {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    }

    // Handle string comparison
    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    // Apply order
    if (order === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Calculate pagination
  const total = filteredUsers.length;
  const pages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      users: paginatedUsers,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    },
  };
};
