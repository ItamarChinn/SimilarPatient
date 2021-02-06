var patientsData = [];

function getName(patient) {
    var name = patient.name;
    if (name && name.length > 0) {
        return name[0].given.join(" ") + " " + name[0].family.join(" ");
    }
    return "deidentified patient";
}

function printDataSet(patients) {
    var out = "";
    var length = 0;

    patients.filter(function (p) {
        return p.activeMeds;
    }).sort(function (p1, p2) {
        if (p1.activeMeds !== p2.activeMeds) {
            return p2.activeMeds - p1.activeMeds;
        }
        return (p1.name < p2.name) ? -1 : 1;
    }).forEach(function (p) {
        out += "<b>" + p.name + "</b> - " + p.activeMeds +
            " active medications<br/>\n";
        length += 1;
    });
    $(".content").html(out);
    $(".count").text(" (" + length + ")");
}

FHIR.oauth2.ready(function (smart) {
    var api = smart.api;
    var queue = [
        function () {
            printDataSet(patientsData)
        },
        function () {
            $(".pct").text("100%");
            $(".progressbar-inner").css("width", "100%");
            setTimeout(next, 200);
        }
    ];
    var length;

    function next() {
        var progress = Math.ceil(100 - queue.length * 100 / length);
        $(".pct").text(progress + "%");
        $(".progressbar-inner").css("width", progress + "%");
        (queue.pop())();
    }

    function processPatient(patient) {
        api.fetchAll({
            type: "MedicationOrder",
            query: {
                patient: patient.id,
                status: "active"
            }
        })
            .then(function (meds) {
                patientsData.push({
                    name: getName(patient),
                    activeMeds: meds.length
                });
                next();
            });
    }

    api.fetchAll({ type: "Patient" }).then(function (patients) {
        patients.forEach(function (patient) {
            queue.push(function () {
                processPatient(patient)
            });
        });
        length = queue.length;
        next();
    });
});
