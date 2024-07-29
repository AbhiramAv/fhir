import { oauth2 as SMART } from 'fhirclient';
import React from 'react';
import './SignIn.css'; // Adjust the path as necessary
import signInLogo from '/Users/sooryarajendran/fhir-react/src/EPIC HYPERSPACE.png'; // Adjust path as necessary

const SignIn = () => {
    const clientId = "9e43034e-949f-41f5-880e-eb31a7663bee"; // Replace with your client id
    const redirect = process.env.NODE_ENV === 'production'
        ? "https://lucid-wozniak-940eae.netlify.app/callback"
        : "http://localhost:3000/callback";

    const handleSignIn = () => {
        SMART.authorize({
            clientId: clientId,
            scope: "launch/patient openid fhirUser patient/*.read Questionnaire.read Questionnaire.search QuestionnaireResponse.read QuestionnaireResponse.create QuestionnaireResponse.search Patient.read Patient.search Patient.create",
            redirectUri: redirect,
            iss: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/"
        });
    };

    return (
        <div className="page">
            <div className="login-box">
                <img src={signInLogo} alt="Sign In Logo" className="sign-in-logo" />
                <button className="btn btn-info" onClick={handleSignIn}>
                    Sign in with EPIC
                </button>
            </div>
        </div>
    );
};

export default SignIn;
