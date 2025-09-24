# 🤖 AI Model Integration Documentation

## Overview

The Slim Backend now includes comprehensive integration with your FastAPI AI model for health predictions. The integration automatically maps user data from the onboarding system to your AI model's expected format.

## 🚀 New API Endpoints

### 1. **Get User AI Prediction**

```http
GET /api/ai/predict
Authorization: Bearer <jwt_token>
```

**Description:** Uses the authenticated user's complete profile data for AI prediction.

**Response:**

```json
{
  "success": true,
  "message": "AI prediction generated successfully",
  "data": {
    "predictions": [
      {
        "profile": "Profile A",
        "probability": 0.75,
        "percentage": "75.0%"
      }
    ],
    "analysisDate": "2025-06-28T10:30:00.000Z",
    "dataCompleteness": {
      "percentage": 85,
      "quality": "high"
    }
  }
}
```

### 2. **Custom AI Prediction**

```http
POST /api/ai/predict/custom
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "Sexe": "M",
  "Age": 30,
  "Taille": 175,
  "P0": 70,
  "TSH": 2.5,
  "profession": "employé",
  "Nb enfants": 0,
  "activité": "modérée"
}
```

**Description:** Allows manual input of data for AI prediction with validation.

### 3. **Onboarding AI Analysis**

```http
POST /api/ai/predict/onboarding
Authorization: Bearer <jwt_token>
```

**Description:** Triggered after onboarding completion, provides AI analysis with bonus XP.

### 4. **AI Service Health Check**

```http
GET /api/ai/health
Authorization: Bearer <jwt_token>
```

**Description:** Checks if the AI service is online and responsive.

## 🔄 Data Mapping

### User Data → AI Model Format

| Slim Backend Field                                     | AI Model Field                   | Transformation                    |
| ------------------------------------------------------ | -------------------------------- | --------------------------------- |
| `basicInfo.gender`                                     | `Sexe`                           | male/Homme → M, female/Femme → F  |
| `basicInfo.dateOfBirth`                                | `Age`                            | Calculate age from birth date     |
| `basicInfo.height`                                     | `Taille`                         | Direct mapping (cm)               |
| `basicInfo.weight`                                     | `P0`                             | Direct mapping (kg)               |
| `labResults.tsh`                                       | `TSH`                            | Direct mapping                    |
| `basicInfo.profession`                                 | `profession`                     | Map to French terms               |
| `basicInfo.numberOfChildren`                           | `Nb enfants`                     | Direct mapping                    |
| `medicalHistory.personalMedicalHistory.diabetesDT2`    | `DT2`                            | yes/no → oui/non                  |
| `medicalHistory.personalMedicalHistory.diabetesDT1`    | `DT1`                            | yes/no → oui/non                  |
| `medicalHistory.personalMedicalHistory.sleepApnea`     | `SAS`                            | yes/no → oui/non                  |
| `medicalHistory.personalMedicalHistory.hypothyroidism` | `Hypothyroidie`                  | yes/no → oui/non                  |
| `lifestyle.stressLevel`                                | `niveau de stress`               | 1-3→faible, 4-7→moyen, 8-10→élevé |
| `basicInfo.activityLevel`                              | `activité`                       | Map activity levels               |
| `basicInfo.smoking`                                    | `Tabac`                          | non_smoker→non, others→oui        |
| `basicInfo.alcohol`                                    | `alcool`                         | no_alcohol→non, others→oui        |
| `lifestyle.exerciseFrequency`                          | `Nombre de séance sport/semaine` | Map frequency ranges              |

## 📋 Required User Data

For AI prediction to work, users must have:

- ✅ Gender (`basicInfo.gender`)
- ✅ Date of Birth (`basicInfo.dateOfBirth`)
- ✅ Height (`basicInfo.height`)
- ✅ Weight (`basicInfo.weight`)
- ✅ TSH Lab Result (`labResults.tsh`)

## 🛠️ Configuration

### Environment Variables

```bash
# Add to your .env file
AI_API_URL=http://127.0.0.1:8000
AI_API_TIMEOUT=30000
```

### Install Dependencies

```bash
npm install axios
```

## 🔄 Integration Points

### 1. **Automatic Analysis After Onboarding**

```javascript
// In onboarding completion flow
const aiResult = await fetch('/api/ai/predict/onboarding', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### 2. **Manual Analysis Request**

```javascript
// User requests analysis
const prediction = await fetch('/api/ai/predict', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### 3. **Custom Data Analysis**

```javascript
// Manual input for testing
const customPrediction = await fetch('/api/ai/predict/custom', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    Sexe: 'F',
    Age: 25,
    Taille: 165,
    P0: 60,
    TSH: 1.8,
  }),
});
```

## 🎯 User Experience Flow

1. **User completes onboarding** (especially lab results)
2. **System automatically checks data completeness**
3. **If sufficient data available** → Generate AI prediction
4. **Store results in user profile** for future reference
5. **Award bonus XP** for completing AI analysis
6. **Display predictions to user** with confidence levels

## 🔍 Data Quality Assessment

The system evaluates data completeness and provides quality scores:

- **High Quality (80%+):** Most accurate predictions
- **Medium Quality (60-79%):** Good predictions with some limitations
- **Low Quality (<60%):** Limited predictions, more data needed

## 📊 Prediction Storage

AI predictions are stored in the user's profile:

```javascript
user.aiAnalysis = {
  lastPrediction: {
    predictions: [...],
    timestamp: Date,
    inputData: {...}
  },
  predictionHistory: [...],
  totalPredictions: Number
}
```

## 🛡️ Error Handling

- **AI service offline:** Graceful degradation with user notification
- **Insufficient data:** Clear guidance on required fields
- **Invalid data:** Validation errors with specific field feedback
- **Timeout errors:** Retry logic with user-friendly messages

## 🧪 Testing

### Test AI Service Health

```bash
curl -X GET http://localhost:3000/api/ai/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test User Prediction

```bash
curl -X GET http://localhost:3000/api/ai/predict \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Custom Prediction

```bash
curl -X POST http://localhost:3000/api/ai/predict/custom \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "Sexe": "M",
    "Age": 30,
    "Taille": 175,
    "P0": 70,
    "TSH": 2.5
  }'
```

## 🚨 Troubleshooting

### Common Issues

1. **"AI service is not responding"**

   - Check if your FastAPI server is running on `http://127.0.0.1:8000`
   - Verify `AI_API_URL` in environment variables

2. **"Insufficient user data for AI prediction"**

   - User needs to complete basic info and lab results
   - Check required fields in response

3. **"AI service error: 422"**
   - Data validation failed in your FastAPI model
   - Check data transformation logic

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages.

## 🔄 Future Enhancements

- [ ] Batch predictions for multiple users
- [ ] Prediction confidence thresholds
- [ ] Historical trend analysis
- [ ] Real-time prediction updates
- [ ] A/B testing for different AI models

---

Your AI model is now fully integrated into the Slim Backend! 🎉
