import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import { oauth2 as SMART } from 'fhirclient';
import Card from './components/Card';
import QRForm from './QRForm';
import formTemplate from './formTemplate.json';

const PatientInfo = () => {
    const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
    const [code, setCode] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [patient, setPatient] = useState("");
    const [patientData, setPatientData] = useState({});
    const clientId = "3d606cf8-37ed-4f3f-93a8-97a42a1e05d2"; // Replace with your client id
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

    const handleQuestionnaireClick = () => {
        setSelectedQuestionnaire(true);
    };

    const showQuestionnaireResponse = () => {
        try {
            const qr = window.LForms.Util.getFormFHIRData('QuestionnaireResponse', 'R4');
            const formData = JSON.stringify(qr, null, 2);
            console.log(formData);
            submitForm(qr);
        } catch (error) {
            console.error('Error showing QuestionnaireResponse:', error);
            alert('Error showing QuestionnaireResponse');
        }
    };

    const questionnaires = ['Questionnaire 1']; // Define your questionnaires here

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-1 space-y-6"
            >
                <Card title="Questionnaires">
                    <ul className="list-none space-y-3 max-h-32 overflow-y-auto">
                        {questionnaires.map((item, index) => (
                            <li
                                key={index}
                                className="flex items-center cursor-pointer hover:text-blue-600"
                                onClick={handleQuestionnaireClick}
                            >
                                <FaArrowRight className="mr-2" /> {item}
                            </li>
                        ))}
                    </ul>
                </Card>
            </motion.div>
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-3"
            >
                {selectedQuestionnaire && (
                    <Card title="Questionnaire 1">
                        <QRForm formToAdd={formTemplate} onSubmit={showQuestionnaireResponse} />
                        <button
                            className="bg-blue-500 text-white py-2 px-4 mt-4 rounded hover:bg-blue-700"
                            onClick={showQuestionnaireResponse}
                        >
                            Preview Responses
                        </button>
                    </Card>
                )}
            </motion.div>
            <div className="container">
                <div style={{ textAlign: 'center' }}>
                    <h1>Smart on FHIR - Patient Info</h1>
                    <p><strong>Username:</strong> fhircamila</p>
                    <p><strong>Password:</strong> epicepic1</p>
                    {!code && (
                        <a
                            className="btn btn-info"
                            style={{ textDecoration: 'none' }}
                            href="javascript:void(0);"
                            onClick={handleSignIn}
                        >
                            Sign in
                        </a>
                    )}
                    <hr />
                </div>
                {accessToken && (
                    <div>
                        <p><strong>Patient Id:</strong> {patient}</p>

                        {patientData.name && <><strong>Name: </strong>{patientData.name[0].text}<br /></>}
                        {patientData.birthDate && <><strong>Birth Date: </strong>{patientData.birthDate}<br /></>}
                        {patientData.gender && <><strong>Gender: </strong>{patientData.gender}<br /></>}
                        {patientData.deceasedBoolean !== undefined && <><strong>Vital Status: </strong>{patientData.deceasedBoolean ? "Dead" : "Alive"}<br /></>}
                        {patientData.maritalStatus && <><strong>Marital Status: </strong>{patientData.maritalStatus.text}<br /></>}
                        {patientData.telecom && (
                            <>
                                <strong>Telecom: </strong>
                                <div>
                                    {patientData.telecom.map((telecom, index) => (
                                        <div key={index} className="ml-2">
                                            <strong>{telecom.system}</strong> - {telecom.use} {telecom.value}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {patientData.address && (
                            <>
                                <strong>Address: </strong>
                                <div>
                                    {patientData.address.map((address, index) => (
                                        <div key={index} className="ml-2">
                                            <strong>{address.use} -</strong> {address.line.toString()}, {address.city}, {address.district}, {address.state}, {address.postalCode}, {address.country}
                                            {address.period && address.period.start && <> <strong>From</strong> {address.period.start}</>}
                                        </div>
                                    ))}
                                </div>
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
                        <strong>Access code:</strong>
                        <p className="ml-2" style={{ wordBreak: 'break-all' }}>{code}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientInfo;
