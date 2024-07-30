import axios from 'axios';
import { oauth2 as SMART } from 'fhirclient';
import React, { useEffect, useState } from 'react';
import QRForm from './QRForm';
import formTemplate from './formTemplate.json';

const PatientInfo = () => {
    const [code, setCode] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [patient, setPatient] = useState("");
    const [patientData, setPatientData] = useState({});
    const [questionnaires, setQuestionnaires] = useState([]);
    const [questionnaireResponses, setQuestionnaireResponses] = useState([]);
    const [selectedContent, setSelectedContent] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showQuestionnaires, setShowQuestionnaires] = useState(false);
    const [showResponses, setShowResponses] = useState(false);
    const clientId = "9e43034e-949f-41f5-880e-eb31a7663bee"; // Replace with your client id
    const redirect = process.env.NODE_ENV === 'production'
        ? "https://lucid-wozniak-940eae.netlify.app/callback"
        : "http://localhost:3000/callback";

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const codeParam = urlParams.get('code');
        if (codeParam) {
            setCode(codeParam);
            fetchToken(codeParam);
        }
    }, []);

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
                `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Questionnaire/eU7pqmsZY1Mzn5Q6N3sr5CypVI-gW8oj3qZkRi4fCIS83`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setQuestionnaires(response.data.entry || []);
        } catch (error) {
            console.error('Error fetching questionnaires:', error.response ? error.response.data : error);
        }
    };

    // const fetchQuestionnaireResponses = async () => {
    //     try {
    //         const response = await axios.get(
    //             `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/QuestionnaireResponse`,
    //             { headers: { Authorization: `Bearer ${accessToken}` } }
    //         );
    //         setQuestionnaireResponses(response.data.entry || []);
    //     } catch (error) {
    //         console.error('Error fetching questionnaire responses:', error.response ? error.response.data : error);
    //     }
    // };

    const submitForm = async (filledForm) => {
        try {

            const pretty = JSON.stringify(filledForm, null, 2);
            document.querySelector("#insertResponse").textContent = pretty;

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

    const handleSignIn = () => {
        SMART.authorize({
            clientId: clientId,
            scope: "launch/patient openid fhirUser patient/*.read Questionnaire.read Questionnaire.search QuestionnaireResponse.read QuestionnaireResponse.create QuestionnaireResponse.search Patient.read Patient.search Patient.create",
            redirectUri: redirect,
            iss: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/"
        });
    };

    const handleLogout = () => {
        sessionStorage.clear();
        window.location.href = redirect;
    };

    const handleItemClick = (item) => {
        setSelectedContent(item);
    };

    const toggleProfile = () => {
        setShowProfile(!showProfile);
    };

    const toggleQuestionnaires = () => {
        setShowQuestionnaires(!showQuestionnaires);
    };

    const toggleResponses = () => {
        setShowResponses(!showResponses);
    };

    return (
        <div className="container">
            {!code && (
                <a className="btn btn-info" href="javascript:void(0);" onClick={handleSignIn}>
                    Sign in with Epic
                </a>
            )}

            {accessToken && (
                <>
                    <header className="header">
                        <div className="title">SMARTonFHIR</div>
                        <div>
                            {patientData.name && <><strong>Name: </strong>{patientData.name[0].text}<br /></>}
                            {patientData.birthDate && <><strong>Date of Birth: </strong>{patientData.birthDate}<br /></>}
                            {patientData.gender && <><strong>Gender: </strong>{patientData.gender}<br /></>}
                            <button className="btn btn-info" onClick={toggleProfile}>Patient Profile</button>
                        </div>
                    </header>

                    <div className="main-content">
                        <div className="left-content">
                            <div className="box">
                                <h2 onClick={toggleQuestionnaires}>Questionnaires <span className="arrow">{showQuestionnaires ? 'v' : '>'}</span></h2>
                                {showQuestionnaires && (<QRForm formToAdd={formTemplate} onSubmit={submitForm} />)}
                            </div>

                            {/* <div className="box">
                                <h2 onClick={toggleResponses}>Questionnaire Responses <span className="arrow">{showResponses ? 'v' : '>'}</span></h2>
                                {showResponses && (<pre id = "insertResponse"></pre>)}
                            </div> */}
                        </div>

                        <div className="right-box">
                            {/* {selectedContent && (
                                <div className="box">
                                    <h2>{selectedContent.resource.title}</h2>
                                    <pre>{JSON.stringify(selectedContent.resource, null, 2)}</pre>
                                    <pre id = "insertResponse"></pre>
                                </div>
                            )} */}
                            <pre id = "insertResponse"></pre>
                        </div>
                    </div>

                    {showProfile && (
                        <div className="box patient-info">
                            <p><strong>Patient Id:</strong> {patient}</p>
                            {patientData.name && <><strong>Name: </strong>{patientData.name[0].text}<br /></>}
                            {patientData.birthDate && <><strong>Birth Date: </strong>{patientData.birthDate}<br /></>}
                            {patientData.gender && <><strong>Gender: </strong>{patientData.gender}<br /></>}
                            {patientData.deceasedBoolean !== undefined && <><strong>Vital Status: </strong>{patientData.deceasedBoolean ? "Dead" : "Alive"}<br /></>}
                            {patientData.maritalStatus && <><strong>Marital Status: </strong>{patientData.maritalStatus.text}<br /></>}
                            {patientData.telecom && (
                                <>
                                    <strong>Telecom: </strong>
                                    {patientData.telecom.map((telecom, index) => (
                                        <div key={index}>
                                            <strong>{telecom.system}</strong> - {telecom.use} {telecom.value}
                                        </div>
                                    ))}
                                </>
                            )}
                            {patientData.address && (
                                <>
                                    <strong>Address: </strong>
                                    {patientData.address.map((address, index) => (
                                        <div key={index}>
                                            <strong>{address.use} -</strong> {address.line.join(', ')}, {address.city}, {address.state}, {address.postalCode}, {address.country}
                                            {address.period && address.period.start && <> <strong>From</strong> {address.period.start}</>}
                                        </div>
                                    ))}
                                </>
                            )}
                            {patientData.communication && patientData.communication[0].language && (
                                <><strong>Language: </strong>{patientData.communication[0].language.coding[0].display}<br /></>
                            )}
                            {patientData.generalPractitioner && (
                                <><strong>General Practitioner: </strong>{patientData.generalPractitioner[0].display}<br /></>
                            )}
                            {patientData.managingOrganization && (
                                <><strong>Managing Organization: </strong>{patientData.managingOrganization.display}<br /></>
                            )}
                            <hr />
                        </div>
                    )}

                    <div>
                        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PatientInfo;
