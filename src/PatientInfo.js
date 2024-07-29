import axios from 'axios';
import { oauth2 as SMART } from 'fhirclient';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRForm from './QRForm';
import formTemplate from './formTemplate.json';
import patientIcon from './humanIcon.png'; // Correctly import the image
import './index.css'; // Adjust the path as necessary

const PatientInfo = () => {
    const [code, setCode] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [patient, setPatient] = useState("");
    const [patientData, setPatientData] = useState({});
    const [questionnaires, setQuestionnaires] = useState([]);
    const [showResource, setShowResource] = useState(false);
    const [showForm, setShowForm] = useState(false); // New state to toggle form display
    const clientId = "3d606cf8-37ed-4f3f-93a8-97a42a1e05d2"; // Replace with your client id
    const redirect = process.env.NODE_ENV === 'production'
        ? "https://lucid-wozniak-940eae.netlify.app/callback"
        : "http://localhost:3000/callback";
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const codeParam = urlParams.get('code');
        if (codeParam) {
            setCode(codeParam);
            fetchToken(codeParam);
        } else if (!accessToken) {
            navigate('/');
        }
    }, [accessToken, navigate]);

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
            console.log('Token response:', response.data);
            setAccessToken(response.data.access_token);
            setPatient(response.data.patient);
        } catch (error) {
            console.error('Authorization error:', error.response ? error.response.data : error);
        }
    };

    useEffect(() => {
        if (accessToken && patient) {
            fetchPatientData();
            fetchQuestionnaires();
        }
    }, [accessToken, patient]);

    const fetchPatientData = async () => {
        try {
            const response = await axios.get(
                `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/${patient}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            console.log('Patient data response:', response.data);
            setPatientData(response.data);
        } catch (error) {
            console.error('Error fetching patient data:', error.response ? error.response.data : error);
        }
    };

    const fetchQuestionnaires = async () => {
        try {
            const response = await axios.get(
                `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Questionnaire`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setQuestionnaires(response.data.entry || []);
        } catch (error) {
            console.error('Error fetching questionnaires:', error.response ? error.response.data : error);
        }
    };

    const handleSignIn = () => {
        SMART.authorize({
            clientId: clientId,
            scope: "launch/patient openid fhirUser patient/*.read Questionnaire.read Questionnaire.search QuestionnaireResponse.read QuestionnaireResponse.create QuestionnaireResponse.search Patient.read Patient.search Patient.create",
            redirectUri: redirect,
            iss: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/"
        });
    };

    const submitForm = async (filledForm) => {
        try {
            const response = await axios.post(
                'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/QuestionnaireResponse',
                filledForm,  // Assuming filledForm is correctly structured for FHIR
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

    const handleLogout = () => {
        sessionStorage.clear();
        window.location.href = redirect;
    };

    const toggleResource = () => {
        setShowResource(!showResource);
    };

    const toggleForm = () => {
        setShowForm(!showForm);
    };

    const displayPatientDataJSON = () => {
        return JSON.stringify(patientData, null, 2) || '{}';
    };

    return (
        <div className="container">
            <div className="header">
                <h1>SMART on FHIR</h1>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
            <div className="dashboard">
                <div className="sidebar">
                    <div className="patient-info">
                        <img src={patientIcon} alt="Patient" className="patient-image" />
                        <p><strong>Patient Id:</strong> {patient}</p>
                        <p><strong>Name:</strong> {patientData.name && patientData.name[0].text}</p>
                        <p><strong>Birth Date:</strong> {patientData.birthDate}</p>
                        <p><strong>Gender:</strong> {patientData.gender}</p>
                        <p><strong>Vital Status:</strong> {patientData.deceasedBoolean ? "Dead" : "Alive"}</p>
                        {patientData.maritalStatus && <p><strong>Marital Status:</strong> {patientData.maritalStatus.text}</p>}
                        {patientData.telecom && patientData.telecom.map((telecom, index) => (
                            <p key={index}><strong>{telecom.system} ({telecom.use}):</strong> {telecom.value}</p>
                        ))}
                        {patientData.address && patientData.address.map((address, index) => (
                            <p key={index}>
                                <strong>Address ({address.use}):</strong> {address.line.join(', ')}, {address.city}, {address.state}, {address.postalCode}, {address.country}
                                {address.period && address.period.start && <> from {address.period.start}</>}
                            </p>
                        ))}
                        {patientData.communication && (
                            <p><strong>Language:</strong> {patientData.communication[0].language.coding[0].display}</p>
                        )}
                        {patientData.generalPractitioner && (
                            <p><strong>General Practitioner:</strong> {patientData.generalPractitioner[0].display}</p>
                        )}
                        {patientData.managingOrganization && (
                            <p><strong>Managing Organization:</strong> {patientData.managingOrganization.display}</p>
                        )}
                    </div>
                    <button className="show-details-button" onClick={toggleResource}>
                        {showResource ? 'Hide Patient Data JSON' : 'Show Patient Data JSON'}
                    </button>
                    {showResource && (
                        <pre className="resource-access-box">{displayPatientDataJSON()}</pre>
                    )}
                </div>
                <div className="content-area">
                    <div className="button-container">
                        <button className="btn-saved-response">Saved Questionnaire Response</button>
                        <button className="btn-ahc-questionnaire" onClick={toggleForm}>
                            AHC Questionnaire
                        </button>
                    </div>
                    <div className="main-content">
                        {showForm && (
                            <div className={`form-container ${showForm ? 'active' : ''}`}>
                                <QRForm formToAdd={formTemplate} onSubmit={submitForm} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientInfo;
