function formatA(data) {
    return "<a href=\"https://talosintelligence.com/reputation_center/lookup?search="+data+"\">"+data+"</a>";
}

function formatMX(data) {
    return data.preference + " " + data.exchange;
}

function formatSOA(data) {
    return data.mname + ". " + data.rname + ". " + data.serial + " " + data.refresh + " " + data.retry + " " + data.expire + " " + data.minimum;
}

function parseAnswers(answers) {
    var response = {
        name: "",
        ttl: 0,
        type: "",
        value: []
    };

    answers.forEach( answer => {
        response.name = answer.name;
        response.ttl = answer.ttl;
        response.type = answer.type;
        response.value.push(answer.data);
    });

    return response;
}

function formatAnswer(type, answer) {
    switch (type) {
        case "A":
            answer = formatA(answer);
            break;
        case "MX":
            answer = formatMX(answer);
            break;
        case "SOA":
            answer = formatSOA(answer);
            break;
    }

    return answer;
}