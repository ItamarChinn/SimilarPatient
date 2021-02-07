import os
import numpy as np

import json
import fhirclient

import config


class FhirData:
    def __init__(self, fhir_json):
        self.data = fhir_json

    def get_id(self):
        return self.data["entry"][0]["resource"]["id"]

    def get_age(self):
        age = self.data["entry"][0]["resource"]["extension"][6]["valueDecimal"]
        return age

    def get_gender(self):
        gender = self.data["entry"][0]["resource"]["extension"][3]["valueCode"]
        return gender


class PatientNode:
    def __init__(self, fhir_data):
        self.neighbours = {}
        self.id = None
        self.bmi = None
        self.age = None
        self.gender = None
        self.health_parameters = None
        self.fhir_data = fhir_data

    def collect_parameters(self):
        self.id = self.fhir_data.get_id()

        self.age = self.fhir_data.get_age()

        self.gender = self.fhir_data.get_gender()
        gender_encoding = 1 if self.gender == "F" else 0

        # TODO: Replace hard-coded value
        self.bmi = 10

        self.health_parameters = np.array([self.age, gender_encoding, self.bmi])

    def calculate_similarity(self, other_patient):
        similarity_score = np.dot(self.health_parameters, other_patient.health_parameters)

        self.neighbours[other_patient.id] = similarity_score
        other_patient.neighbours[self.id] = similarity_score


def read_json(json_path):
    with open(json_path, 'r') as f:
        data = json.load(f)

    return data

# TODO: FHIR client request
def sample_patients(patient_json_dir, num_patients=10):
    patient_json_paths = os.listdir(patient_json_dir)
    patient_list = {}

    for i in range(num_patients):
        json_path = os.path.join(patient_json_dir, patient_json_paths[i])
        patient_fhir_data = FhirData(read_json(json_path))

        patient = PatientNode(patient_fhir_data)
        patient.collect_parameters()

        patient_list[patient.id] = patient

    return patient_list


def find_patient_neighbours(patient_list):
    num_patients = len(patient_list)
    patient_ids = list(patient_list.keys())

    for i, first_patient_id in enumerate(patient_ids):
        if i + 1 == num_patients:
            continue

        # TODO: Change the sliced list to an if statement
        for second_patient_id in patient_ids[i+1:]:
            patient_list[first_patient_id].calculate_similarity(patient_list[second_patient_id])


# TODO: Assume file will be called from command line with the first argument a list (or maybe string) of JSONs
# TODO: List of 5 top most similar patient jsons with the similarity score

PATIENT_DATA_PATH = config.FHIR_DATA_PATH

patient_list = sample_patients(PATIENT_DATA_PATH)
find_patient_neighbours(patient_list)

