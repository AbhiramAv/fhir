# Epic FHIR Server Connection Issues & Solutions

## Overview

During the development of the SMARTonFHIR Patient Info App, several issues were encountered while connecting to the Epic FHIR server. This document outlines those issues, their causes, and the solutions implemented to resolve them. This information is intended to help future developers avoid similar problems and quickly troubleshoot any connection issues that may arise.

## Table of Contents

1. [Authorization Issues](#authorization-issues)
    - Missing Authorization Code
    - Invalid Client ID or Secret
    - Invalid Redirect URI
2. [Token Fetching Issues](#token-fetching-issues)
    - Invalid Grant Type
    - Invalid Authorization Code
3. [Data Fetching Issues](#data-fetching-issues)
    - Unauthorized Access
    - Invalid Resource ID
    - Server Unavailability

## Authorization Issues

1. ### Missing Authorization Code

**Issue:** The authorization code was not being captured from the URL after the redirect.

**Cause:** Incorrect handling of the URL parameters.

**Solution:**
```javascript
useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    if (codeParam) {
        setCode(codeParam);
        fetchToken(codeParam);
    }
}, []);
```

2. ### Invalid Client ID or Secret

**Issue:** The client ID or secret provided was invalid, leading to failed authorization attempts.

**Cause:** Typographical errors or incorrect credentials.

**Solution:** Ensure the correct client ID and secret are used. These can typically be found in the application's configuration settings in the Epic FHIR portal.


3. ### Invalid Redirect URI

**Issue:** The redirect URI did not match the one registered with the Epic FHIR application.

**Cause:** Mismatch between the registered URI and the one used in the application

**Solution:** Verify and update the redirect URI in both the Epic FHIR application settings and the application's code:
```javascript
const redirect = process.env.NODE_ENV === 'production'
    ? "https://your-production-url.com/callback"
    : "http://localhost:3000/callback";
```

## Token Fetching Issues

1. ### Invalid Grant Type

**Issue:** The token fetch request failed due to an invalid grant type.

**Cause:** Incorrect grant type specified in the request parameters.

**Solution:**
```javascript
const params = new URLSearchParams();
params.append('grant_type', 'authorization_code');
params.append('redirect_uri', redirect);
params.append('code', codeParam);
params.append('client_id', clientId);
```
2. ### Invalid Authorization Code

**Issue:** The authorization code provided was invalid or expired.

**Cause:** Delay in using the authorization code or incorrect handling of the code.

**Solution:** Ensure the authorization code is used immediately after it is received and handle it correctly in the code.

## Data Fetching Issues

1. ### Unauthorized Access

**Issue:** Requests to fetch patient data or questionnaires returned unauthorized access errors.

**Cause:** Missing or invalid access token.

**Solution:**
```javascript
const config = {
    headers: {
        'Authorization': `Bearer ${accessToken}`
    }
};
```

2. ### Invalid Resource ID

**Issue:** Requests to fetch specific resources returned errors due to invalid resource IDs.

**Cause:** Server maintenance or network issues.

**Solution:** Retry the request after some time or check the Epic FHIR status page for maintenance updates.

3. ### Server Unavailability

**Issue:** The Epic FHIR server was temporarily unavailable.

**Cause:** Server maintenance or network issues.

**Solution:** Retry the request after some time or check the Epic FHIR status page for maintenance updates.
