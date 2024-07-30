import React, { useEffect } from 'react';
// Include the necessary styles and scripts
const lhcFormsStyles = "https://lhcforms-static.nlm.nih.gov/lforms-versions/34.0.0/webcomponent/styles.css";
const zoneJs = "https://lhcforms-static.nlm.nih.gov/lforms-versions/34.0.0/webcomponent/assets/lib/zone.min.js";
const lhcFormsJs = "https://lhcforms-static.nlm.nih.gov/lforms-versions/34.0.0/webcomponent/lhc-forms.js";
const lhcFormsFHIRJs = "https://lhcforms-static.nlm.nih.gov/lforms-versions/34.0.0/fhir/R4/lformsFHIR.min.js";
// Removing the TypeScript 'declare global' and interface, instead using direct access
window.LForms = window.LForms || {};
const QRForm = ({ formToAdd, onSubmit }) => {
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(`Failed to load script ${src}`);
        document.body.appendChild(script);
      });
    };
    const loadScriptsSequentially = async () => {
      try {
        await loadScript(zoneJs);
        await loadScript(lhcFormsJs);
        await loadScript(lhcFormsFHIRJs);
        if (typeof window.LForms !== 'undefined') {
          window.LForms.Util.addFormToPage(formToAdd, 'formContainer');
        } else {
          console.error('LForms is not defined even after loading scripts.');
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadScriptsSequentially();
    return () => {
      const scripts = document.querySelectorAll(`script[src="${zoneJs}"], script[src="${lhcFormsJs}"], script[src="${lhcFormsFHIRJs}"]`);
      scripts.forEach(script => document.body.removeChild(script));
    };
  }, [formToAdd]);

  const showQR = () => {
    try {
      const qr = window.LForms.Util.getFormFHIRData('QuestionnaireResponse', 'R4');
      qr.questionnaire = 'Questionnaire/eU7pqmsZY1Mzn5Q6N3sr5CypVI-gW8oj3qZkRi4fCIS83';
      qr.subject = {};
      qr.subject.identifier = {};
      qr.subject.identifier.system = 'urn:oid:1.2.840.114350.1.13.5325.1.7.2.728165';
      qr.subject.identifier.value = '106731';
      
      const formData = JSON.stringify(qr, null, 2);
      console.log(formData);

      /* display QuestionnaireResponse locally */
      

      onSubmit(qr);  // Call the onSubmit function passed as a prop
    } catch (error) {
      console.error('Error showing QuestionnaireResponse:', error);
      alert('Error showing QuestionnaireResponse');
    }
  };
  return (
    <div>
      <link href={lhcFormsStyles} media="screen" rel="stylesheet" />
      <div id="formContainer"></div>
      <br></br>
      <button className="btn btn-submit" onClick={showQR}>Show FHIR QuestionnaireResponse</button>
    </div>
  );
};
export default QRForm;