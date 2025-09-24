// Handle "Aucun" checkbox logic for Prise en charge médicale (multi-select)
const ttmedicalCheckboxes = document.getElementsByName('TT_medical');
const ttmedicalNone = document.getElementById('ttmedical-none');
if (ttmedicalCheckboxes && ttmedicalNone) {
  ttmedicalCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
      if (ttmedicalNone.checked) {
        ttmedicalCheckboxes.forEach((cb) => {
          if (cb !== ttmedicalNone) cb.checked = false;
        });
      } else if (this !== ttmedicalNone && this.checked) {
        ttmedicalNone.checked = false;
      }
    });
  });
}
// Handle "Aucun" checkbox logic for Traitements en cours (multi-select)
const treatmentsCheckboxes = document.getElementsByName('traitements');
const treatmentsNone = document.getElementById('treatments-none');
if (treatmentsCheckboxes && treatmentsNone) {
  treatmentsCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
      if (treatmentsNone.checked) {
        treatmentsCheckboxes.forEach((cb) => {
          if (cb !== treatmentsNone) cb.checked = false;
        });
      } else if (this !== treatmentsNone && this.checked) {
        treatmentsNone.checked = false;
      }
    });
  });
}
// Handle "Aucun" checkbox logic for Troubles psychologiques (multi-select)
const troublepsyCheckboxes = document.getElementsByName('trouble_psy');
const troublepsyNone = document.getElementById('troublepsy-none');
if (troublepsyCheckboxes && troublepsyNone) {
  troublepsyCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
      if (troublepsyNone.checked) {
        troublepsyCheckboxes.forEach((cb) => {
          if (cb !== troublepsyNone) cb.checked = false;
        });
      } else if (this !== troublepsyNone && this.checked) {
        troublepsyNone.checked = false;
      }
    });
  });
}
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // Handle "Aucun" checkbox logic for Antécédents familiaux (multi-select)
  const familialCheckboxes = document.getElementsByName('terrain_familial');
  const familialNone = document.getElementById('familial-none');
  if (familialCheckboxes && familialNone) {
    familialCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', function () {
        if (familialNone.checked) {
          familialCheckboxes.forEach((cb) => {
            if (cb !== familialNone) cb.checked = false;
          });
        } else if (this !== familialNone && this.checked) {
          familialNone.checked = false;
        }
      });
    });
  }
  // Get DOM elements
  const form = document.getElementById('obesity-form');
  const resultsSection = document.getElementById('results-section');
  const resultsContainer = document.getElementById('results-container');
  const loadingIndicator = document.getElementById('loading');
  const resetButton = document.getElementById('reset-button'); // API endpoint
  const API_ENDPOINT = 'https://profile-prediction-api.onrender.com/predict'; // Make sure this matches your actual API endpoint

  // Add event listener for form submission
  form.addEventListener('submit', async function (event) {
    // Prevent default form submission
    event.preventDefault();

    // Show loading indicator
    loadingIndicator.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    resultsSection.classList.remove('hidden');

    try {
      // Collect form data
      const formData = new FormData(form);
      const data = {}; // Convert form data to appropriate format for API
      for (let [key, value] of formData.entries()) {
        // Convert numeric values to numbers
        if (
          [
            'Age',
            'Nb enfants',
            'Nombre de séance sport/semaine',
            'Taille',
            'P0',
            'MG0',
            'MM0',
            'OBJECTIF MG',
            'Objectif MM',
            'TSH',
          ].includes(key)
        ) {
          data[key] = Number(value);
        } else {
          data[key] = value;
        }
      }

      // Log detailed information about the API request
      console.log('============== API REQUEST DEBUG INFO ==============');
      console.log('Raw form data:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value} (${typeof value})`);
      }

      console.log('Processed data payload:');
      console.log(data);

      // Convert to JSON to see exactly what will be sent
      const jsonPayload = JSON.stringify(data, null, 2);
      console.log('JSON payload:');
      console.log(jsonPayload);
      console.log('==============================================');
      // Make API request
      console.log(`Sending request to: ${API_ENDPOINT}`);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Log response details
      console.log('============== API RESPONSE DEBUG INFO ==============');
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Response headers:');
      response.headers.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      // Check if response is ok
      if (!response.ok) {
        console.error('API error response:', response);
        throw new Error(
          `API response was not ok. Status: ${response.status} - ${response.statusText}`
        );
      }

      // Parse response
      const result = await response.json();
      console.log('API response data:');
      console.log(result);
      console.log('====================================================');

      // Display results
      displayResults(result);
    } catch (error) {
      console.error('============== ERROR DEBUG INFO ==============');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('==============================================');

      // Display user-friendly error message
      resultsContainer.innerHTML = `
                <div class="error-message">
                    <h3>Error occurred</h3>
                    <p>${
                      error.message ||
                      'Failed to get prediction. Please try again.'
                    }</p>
                    <div class="error-details">
                        <p>Please check the browser console for more details.</p>
                        <p>If the problem persists, please contact the administrator.</p>
                    </div>
                </div>
            `;
    } finally {
      // Hide loading indicator
      loadingIndicator.classList.add('hidden');
    }
  });

  // Reset button event listener
  resetButton.addEventListener('click', function () {
    // Hide results section
    resultsSection.classList.add('hidden');
    resultsContainer.innerHTML = '';
  }); // Function to display results
  function displayResults(result) {
    // Clear any previous results
    resultsContainer.innerHTML = '';

    // Create heading for predictions
    const predictionsHeading = document.createElement('h3');
    predictionsHeading.textContent = 'Obesity Profile Analysis';
    predictionsHeading.style.marginBottom = '20px';
    resultsContainer.appendChild(predictionsHeading);

    // Create container for prediction results
    const analysisContainer = document.createElement('div');
    analysisContainer.classList.add('analysis-container');

    // Define colors for the profiles
    const colors = {
      psychologique: '#3498db', // Blue
      metabolique: '#2ecc71', // Green
      hormonal: '#9b59b6', // Purple
      iatrogene: '#e67e22', // Orange
      digestif: '#e74c3c', // Red
    };

    // Default color if profile not in predefined colors
    const defaultColor = '#1abc9c'; // Turquoise

    // Sort predictions by probability (highest first)
    if (result.predictions && Array.isArray(result.predictions)) {
      // Sort predictions by probability in descending order
      result.predictions.sort((a, b) => b.probability - a.probability);

      // Display highest profile as primary result
      const highestProfile = result.predictions[0];
      const summaryDiv = document.createElement('div');
      summaryDiv.classList.add('results-summary');
      summaryDiv.innerHTML = `
                <h3>Primary Profile: <span style="color: ${
                  colors[highestProfile.profile] || defaultColor
                }">
                    ${capitalizeFirstLetter(highestProfile.profile)}
                </span> (${highestProfile.percentage})</h3>
                <p>Your obesity profile analysis indicates a predominant ${
                  highestProfile.profile
                } component.</p>
            `;
      resultsContainer.appendChild(summaryDiv);

      // Create a container for bars
      const barsContainer = document.createElement('div');
      barsContainer.classList.add('bars-container');
      barsContainer.style.marginTop = '30px';

      // Add a label for the chart
      const chartLabel = document.createElement('h4');
      chartLabel.textContent = 'Profile Distribution';
      chartLabel.style.marginBottom = '15px';
      barsContainer.appendChild(chartLabel);

      // Create the bars for each profile
      result.predictions.forEach((pred) => {
        // Get numeric percentage value (remove % sign)
        const percentValue = parseFloat(pred.percentage.replace('%', ''));

        // Create container for this prediction item
        const predictionItem = document.createElement('div');
        predictionItem.classList.add('prediction-item');
        predictionItem.style.marginBottom = '15px';
        predictionItem.style.display = 'flex';
        predictionItem.style.alignItems = 'center';

        // Create label with profile name
        const labelDiv = document.createElement('div');
        labelDiv.classList.add('prediction-label');
        labelDiv.style.width = '120px';
        labelDiv.style.fontWeight = 'bold';
        labelDiv.style.textTransform = 'capitalize';
        labelDiv.textContent = pred.profile;

        // Create the bar visualization
        const barContainer = document.createElement('div');
        barContainer.style.flex = '1';
        barContainer.style.position = 'relative';
        barContainer.style.height = '30px';

        const barBackground = document.createElement('div');
        barBackground.style.width = '100%';
        barBackground.style.height = '100%';
        barBackground.style.backgroundColor = '#f1f1f1';
        barBackground.style.borderRadius = '4px';

        const barFill = document.createElement('div');
        barFill.style.position = 'absolute';
        barFill.style.top = '0';
        barFill.style.left = '0';
        barFill.style.width = `${percentValue}%`;
        barFill.style.height = '100%';
        barFill.style.backgroundColor = colors[pred.profile] || defaultColor;
        barFill.style.borderRadius = '4px';
        barFill.style.transition = 'width 1s ease-in-out';

        // Create percentage indicator
        const percentDiv = document.createElement('div');
        percentDiv.classList.add('prediction-value');
        percentDiv.style.position = 'absolute';
        percentDiv.style.top = '50%';
        percentDiv.style.transform = 'translateY(-50%)';
        percentDiv.style.left = `${Math.min(percentValue + 2, 95)}%`;
        percentDiv.style.fontWeight = 'bold';
        percentDiv.style.color = percentValue > 50 ? 'white' : '#333';
        if (percentValue > 50) {
          percentDiv.style.left = '10px';
        }
        percentDiv.textContent = pred.percentage;

        // Assemble the bar
        barContainer.appendChild(barBackground);
        barContainer.appendChild(barFill);
        barContainer.appendChild(percentDiv);

        // Add label and bar to item
        predictionItem.appendChild(labelDiv);
        predictionItem.appendChild(barContainer);

        // Add to bars container
        barsContainer.appendChild(predictionItem);
      });

      analysisContainer.appendChild(barsContainer);

      // Add explanation of results
      const explanationDiv = document.createElement('div');
      explanationDiv.classList.add('explanation');
      explanationDiv.style.marginTop = '30px';
      explanationDiv.style.padding = '15px';
      explanationDiv.style.backgroundColor = '#f9f9f9';
      explanationDiv.style.borderRadius = '8px';
      explanationDiv.style.borderLeft = `4px solid ${
        colors[result.predictions[0].profile] || defaultColor
      }`;

      explanationDiv.innerHTML = `
                <h4>What This Means</h4>
                <p>Your obesity profile has multiple components, with the ${result.predictions[0].profile} factor being most significant (${result.predictions[0].percentage}).</p>
                <p>The profile percentages indicate how strongly each factor contributes to your obesity condition.</p>
                <p>This personalized analysis can help develop a targeted treatment approach focusing on the predominant factors.</p>
                <p class="recommendation">Please consult with a healthcare professional to discuss these results and determine the most appropriate intervention strategy.</p>
            `;

      analysisContainer.appendChild(explanationDiv);
    } else {
      // Fallback if response format is unexpected
      analysisContainer.innerHTML = `
                <div class="error-message">
                    <h3>Unexpected Result Format</h3>
                    <p>The API returned data in an unexpected format. Please check the console for details.</p>
                </div>
            `;
      console.error('Unexpected result format:', result);
    }

    resultsContainer.appendChild(analysisContainer);

    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    // We've already appended the analysis container above, remove duplicate        // We've already added recommendations in the explanation div above
  }
});
