import React, { useState } from 'react';
import { Layout, Input, List, Card, Row, Col, Spin } from 'antd';
import Patient from './Patient';
import './App.css';

const { Header, Content } = Layout;
const Search = Input.Search;

const App = () => {
  const [ loading, setLoading ] = useState(false);
  const [ patients, setPatients ] = useState([]);
  const [ searchResolved, setSearchResolved ] = useState(false);

  const searchPatientNames = (name) => {
    setLoading(true);
    setSearchResolved(false);

    fetch(`api/patient?name=${name}`, {
      accept: 'application/json'
    })
    .then((response) => (
      response.json()
    ))
    .then((patients) => {
      setPatients(patients || []);
      setLoading(false);
      setSearchResolved(true);
    })
    .catch((err) => {
      console.log(err);
      setLoading(false);
    })
  }

  return (
    <Layout className="App">
      <Header className="App-header">
        <h1>Similar Patient</h1>
      </Header>
      <Content className="App-content">
        <Row>
            <p>Here you can search for a patient and find the 5 most similar patient's in your EHR</p>
        </Row>
        <h2>Patient Name Search Example</h2>
        <Search
          className="App-search"
          placeholder="Search Patient Names"
          enterButton="Search"
          size="large"
          onSearch={searchPatientNames}
        />
        { loading ? (
            <Row type="flex" justify="center">
              <Col span={4}>
                <Spin/>
              </Col>
            </Row>
          ) : (
            <List
              className="App-list"
              grid={{ gutter: 16, column: 2 }}
              dataSource={patients}
              locale={searchResolved ? { emptyText: 'No results found.' } : { emptyText: '' }}
              renderItem={patient => (
                <List.Item>
                  <Card title={patient.name}>
                  <Patient
                    id={patient.id}
                    name={patient.name}
                    birthDate={patient.birthDate}
                    gender={patient.gender} />
                  </Card>
                </List.Item>
              )}
            />
        ) }
      </Content>
    </Layout>
  );
};

export default App;
