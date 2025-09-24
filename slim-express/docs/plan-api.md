# Plan API Documentation

## Standardized Plan Request/Assignment System

This document describes the standardized approach for managing user plan requests and assignments.

## Recommended Endpoints

### Get User's Plan

```http
GET /api/users/plan
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response:**

```json
{
  "success": true,
  "message": "Plan retrieved successfully",
  "data": {
    "requestedPlan": true,
    "assignedPlan": true,
    "plan": {
      "profiles": [
        {
          "name": "metabolique",
          "percentage": 47.6
        },
        {
          "name": "iatrogene",
          "percentage": 38.2
        }
      ],
      "sections": {
        "dietetique": [
          "Réduction des glucides raffinés",
          "Alimentation riche en fibres",
          "Augmentation des protéines maigres"
        ],
        "activitePhysique": [
          "Marche quotidienne 30 minutes",
          "Exercices de résistance 2x par semaine"
        ],
        "micronutrition": ["Supplément de vitamine D", "Magnésium"],
        "medicaments": ["Metformine si nécessaire"],
        "interventions": ["Suivi psychologique mensuel"]
      },
      "assignedAt": "2025-06-29T14:30:45.123Z"
    }
  }
}
```

**Error Response (No Plan Assigned):**

```json
{
  "success": false,
  "message": "No plan has been assigned yet",
  "data": {
    "requestedPlan": true,
    "assignedPlan": false
  }
}
```

### Update Plan Status

```http
PUT /api/users/plan-status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "requestedPlan": true,  // optional
  "assignedPlan": false   // optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Plan status updated successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "requestedPlan": true,
      "assignedPlan": false
    }
  }
}
```

This endpoint manages the two plan status flags:

- `requestedPlan`: Indicates if a user has requested a plan
- `assignedPlan`: Indicates if a plan has been assigned to the user

### Admin: Update User's Plan Status

```http
PATCH /api/admin/users/:id/plan-status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "assignedPlan": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Plan status updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "requestedPlan": true,
    "assignedPlan": true
  }
}
```

This admin-only endpoint allows administrators to update a user's `assignedPlan` status.

### Admin: Assign Detailed Plan to User

```http
POST /api/admin/users/:id/assign-plan
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "profiles": [
    {
      "name": "metabolique",
      "percentage": 47.6
    },
    {
      "name": "iatrogene",
      "percentage": 38.2
    }
  ],
  "sections": {
    "dietetique": [
      "Réduction des glucides raffinés",
      "Alimentation riche en fibres",
      "Augmentation des protéines maigres"
    ],
    "activitePhysique": [
      "Marche quotidienne 30 minutes",
      "Exercices de résistance 2x par semaine"
    ],
    "micronutrition": [
      "Supplément de vitamine D",
      "Magnésium"
    ],
    "medicaments": [
      "Metformine si nécessaire"
    ],
    "interventions": [
      "Suivi psychologique mensuel"
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Plan assigned to user successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "requestedPlan": true,
    "assignedPlan": true,
    "plan": {
      "profiles": [
        {
          "name": "metabolique",
          "percentage": 47.6
        },
        {
          "name": "iatrogene",
          "percentage": 38.2
        }
      ],
      "sections": {
        "dietetique": [
          "Réduction des glucides raffinés",
          "Alimentation riche en fibres",
          "Augmentation des protéines maigres"
        ],
        "activitePhysique": [
          "Marche quotidienne 30 minutes",
          "Exercices de résistance 2x par semaine"
        ],
        "micronutrition": ["Supplément de vitamine D", "Magnésium"],
        "medicaments": ["Metformine si nécessaire"],
        "interventions": ["Suivi psychologique mensuel"]
      },
      "assignedAt": "2025-06-29T14:30:45.123Z"
    }
  }
}
```

This admin-only endpoint allows administrators to assign a detailed personalized plan to a user.

## Deprecated Endpoints

### Update Plan Request (Deprecated)

```http
PUT /api/users/plan-request
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "planRequest": true  // or false
}
```

This endpoint is maintained for backward compatibility only. Please use the `/api/users/plan-status` endpoint instead.

## User Object

All authentication responses include the `requestedPlan` and `assignedPlan` properties in the user object:

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "isAdmin": false,
    "requestedPlan": true,
    "assignedPlan": false,
    "onboardingCompleted": true,
    "onboardingStep": 6
  }
}
```

## Implementation Guidelines

1. Always check `requestedPlan` instead of the legacy `planRequest` field.
2. Use `assignedPlan` to track if a plan has been assigned to the user.
3. Display appropriate UI elements based on both values:
   - If `requestedPlan` is true but `assignedPlan` is false: Show "Plan requested" status
   - If both are true: Show "Plan assigned" status
   - If both are false: Show "Request a plan" CTA
