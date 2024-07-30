# Project Documentation for SMARTonFHIR Patient Info App

## Overview

This documentation aims to provide a comprehensive guide on how to set up and work on the SMARTonFHIR Patient Info App. This includes steps taken to get to the current state, and all necessary documentation and references used during the development process.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Dependencies](#dependencies)
3. [Component Structure](#component-structure)
4. [Authorization with Epic FHIR](#authorization-with-epic-fhir)
5. [Fetching Patient Data](#fetching-patient-data)

## Project Setup

1. Clone the repository from GitHub:
    ```bash
    git clone https://github.com/your-repo/smart-on-fhir-app.git
    cd smart-on-fhir-app
    ```

2. Install necessary dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm start
    ```

## Dependencies

The project uses the following main dependencies:
- `axios` for making HTTP requests.
- `fhirclient` for SMART on FHIR authorization.
- `react` for building the user interface.

Ensure these dependencies are installed by checking your `package.json` file.

## Component Structure

The main component is `PatientInfo.js`, which handles the authentication, data fetching, and UI rendering.

### PatientInfo.js

1. **State Variables:**
    - `code`, `accessToken`, `patient`, `patientData`, `questionnaires`, `questionnaireResponses`, `selectedContent`, `showProfile`, `showQuestionnaires`, `showResponses`.

2. **Effect Hooks:**
    - Fetch token, patient data, questionnaires, and responses upon receiving the authorization code and access token.

3. **Functions:**
    - `fetchToken`, `fetchPatientData`, `fetchQuestionnaires`, `fetchQuestionnaireResponses`, `handleSignIn`, `handleLogout`, `handleItemClick`, `toggleProfile`, `toggleQuestionnaires`, `toggleResponses`.

4. **UI Structure:**
    - Header displaying patient info and profile toggle button.
    - Main content with collapsible sections for questionnaires and responses.
    - Detailed view section for selected questionnaire or response.

## Authorization with Epic FHIR

SMART on FHIR authorization is handled using the `fhirclient` library. The following steps outline the process:

1. **Sign In:**
    ```javascript
    const handleSignIn = () => {
        SMART.authorize({
            clientId: clientId,
            scope: "launch/patient openid fhirUser patient/*.read Questionnaire.read Questionnaire.search QuestionnaireResponse.read QuestionnaireResponse.create QuestionnaireResponse.search Patient.read Patient.search Patient.create",
            redirectUri: redirect,
            iss: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/"
        });
    };
    ```

2. **Fetch Token:**
    ```javascript
    const fetchToken = async (codeParam) => {
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', redirect);
        params.append('code', codeParam);
        params.append('client_id', clientId);

        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        try {
            const response = await axios.post(
                'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
                params,
                config
            );
            setAccessToken(response.data.access_token);
            setPatient(response.data.patient);
        } catch (error) {
            console.error('Authorization error:', error.response ? error.response.data : error);
        }
    };
    ```

## Fetching Patient Data

Patient data is fetched using the Epic FHIR API. Here’s the function to fetch patient data:

```javascript
const fetchPatientData = async () => {
    try {
        const response = await axios.get(
            `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/${patient}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setPatientData(response.data);
    } catch (error) {
        console.error('Error fetching patient data:', error.response ? error.response.data : error);
    }
};
