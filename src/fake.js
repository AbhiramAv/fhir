import React, { useEffect } from 'react';
import axios from 'axios';

const QRForm = ({ formToAdd, accessToken }) => {
    useEffect(() => {
        // Existing script loading code remains unchanged
    }, [formToAdd]);

    const submitForm = async () => {
        try {
            const response = await axios.post(
                'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/QuestionnaireResponse',
                formToAdd,  // Assuming formToAdd is correctly structured for FHIR
                {
                    headers: {
                        'Content-Type': 'application/fhir+json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            console.log('Submission response:', response.data);
            alert('Form submitted successfully!');
        } catch (error) {
            console.error('Error submitting form:', error.response ? error.response.data : error);
            alert('Failed to submit form.');
        }
    };

    return (
        <div>
            <link href="https://lhcforms-static.nlm.nih.gov/lforms-versions/34.0.0/webcomponent/styles.css" media="screen" rel="stylesheet" />
            <button onClick={submitForm}>
                Submit FHIR QuestionnaireResponse
            </button>
            <div id="formContainer"></div>
        </div>
    );
};

export default QRForm;