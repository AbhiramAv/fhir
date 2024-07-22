import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientInfo = () => {
    const [code, setCode] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [patient, setPatient] = useState("");
    const [patientData, setPatientData] = useState({});
    const clientId = "9e43034e-949f-41f5-880e-eb31a7663bee"; // Replace with your client id
    const redirect = process.env.NODE_ENV === 'production'
        ? "https://lucid-wozniak-940eae.netlify.app"
        : "http://localhost:3000/callback";

    const authorizeLink = `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize?response_type=code&redirect_uri=${redirect}&client_id=${clientId}&state=1234&scope=patient.read, patient.search`;

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const codeParam = urlParams.get('code');
        if (codeParam) {
            setCode(codeParam);
            const fetchToken = async () => {
                const params = new URLSearchParams();
                params.append('grant_type', 'authorization_code');
                params.append('redirect_uri', redirect);
                params.append('code', codeParam);
                params.append('client_id', clientId);
                params.append('state', '1234');
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
                    console.error('Authorization error:', error);
                }
            };
            fetchToken();
        }
    }, [redirect, clientId]);

    useEffect(() => {
        if (accessToken && patient) {
            const fetchPatientData = async () => {
                try {
                    const response = await axios.get(
                        `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/${patient}`,
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    );
                    setPatientData(response.data);
                } catch (error) {
                    console.error('Error fetching patient data:', error);
                }
            };
            fetchPatientData();
        }
    }, [accessToken, patient]);

    return (
        <div className="container">
            <div style={{ textAlign: 'center' }}>
                <h1>Smart on FHIR - Patient Info</h1>
                <p><strong>Username:</strong> fhircamila</p>
                <p><strong>Password:</strong> epicepic1</p>
                {!code && (
                    <a
                        className="btn btn-info"
                        style={{ textDecoration: 'none' }}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={authorizeLink}
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
                    <p className="ml-2" style={{ wordBreak: 'break-all' }}>{accessToken}</p>
                    <strong>Patient Resource:</strong>
                    <pre>{JSON.stringify(patientData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default PatientInfo;