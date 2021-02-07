const express = require('express');
const Client = require('fhir-kit-client');

const config = { baseUrl: 'https://r4.smarthealthit.org/' };
const fhirClient = new Client(config);
  

const app = express();

app.set("port", process.env.PORT || 3001);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('build'));
}

app.get('/api/patient', (req, res) => {
  if (req.query.name) {
    // client.search({
    //   resourceType: 'Patient',
    //   searchParams: { name: req.query.name }
    // })
    fhirClient.request('Patient')
    .then((response) => {
      // https://stackoverflow.com/questions/23450534/how-to-call-a-python-function-from-node-js
      const spawn = require("child_process").spawn;
      const pythonProcess = spawn('python',["model.py", response.entry]);
      pythonProcess.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      // const patients = response.entry ? response.entry.map((obj) => {
      //   return {
      //     id: obj.resource.id,
      //     name: `${obj.resource.name[0].given} ${obj.resource.name[0].family}`,
      //     gender: obj.resource.gender,
      //     birthDate: obj.resource.birthDate
      //   }
      // }) : [];

      // res.status(200).json(patients);
    });
  } else {
    res.status(200).json([]);
  }
});

app.listen(app.get('port'), () => {
  console.log('Express server started');
});
