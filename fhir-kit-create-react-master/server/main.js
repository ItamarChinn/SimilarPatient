const express = require('express');
const Client = require('fhir-kit-client');

const config = { baseUrl: 'https://r3.smarthealthit.org/' };
const fhirClient = new Client(config);
  

const app = express();

app.set("port", process.env.PORT || 3001);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('build'));
}

app.get('/api/patient', (req, res) => {
  if (req.query.name) {
    client.search({
      resourceType: 'Patient',
      searchParams: { name: req.query.name }
    })
    .then((response) => {
      const patients = response.entry ? response.entry.map((obj) => {
        return {
          id: obj.resource.id,
          name: `${obj.resource.name[0].given} ${obj.resource.name[0].family}`,
          gender: obj.resource.gender,
          birthDate: obj.resource.birthDate
        }
      }) : [];

      res.status(200).json(patients);
    });
  } else {
    res.status(200).json([]);
  }
});

app.get('/api/similarpatient', (req, res) => {
  if (req.query.name) {
    // client.search({
    //   resourceType: 'Patient',
    //   searchParams: { name: req.query.name }
    // })
    fhirClient.request('Patient')
    .then((response) => {

      const patients = response.entry ? response.entry.map((obj) => {
        return {
          id: obj.resource.id,
          name: `${obj.resource.name[0].given} ${obj.resource.name[0].family}`,
          gender: obj.resource.gender,
          birthDate: obj.resource.birthDate
        }
      }) : [];

      const patient_list = response.entry ? response.entry.map((obj) => {
        return obj.resource
      }) : [];

      // https://stackoverflow.com/questions/23450534/how-to-call-a-python-function-from-node-js
       const spawn = require("child_process").spawn;
       const pythonProcess = spawn('python',["model.py", JSON.stringify(patient_list)]); // Successfully parses JSON objects as string for use as Python argument
       /* Python process takes as input a string which is a list of Patient FHIR resource objects.
       Next steps:
       1. Python needs to be parse string into JSON resource objects
       2. Second argument needs to be given to Python of which patient is being compared to
       3. Python needs to return only the FHIR JSONS of the top 5 most similar patients
       4. Front end needs ability to select patient for similar search
       5. JS needs to parse python output into readable patient entries for front-end
       6. Front-end needs to display patients ranked by similarity next to patient compared to
            a. Highlight the similar features (future feature)
       */
       pythonProcess.stdout.on('data', (data) => {
         console.log(data.toString());
       });


      res.status(200).json(patients);
    });
  } else {
    res.status(200).json([]);
  }
});

app.listen(app.get('port'), () => {
  console.log('Express server started');
});
