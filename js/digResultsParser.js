function parseAnswers(answers, dnsType) {
    var response = {
        name: "",
        ttl: 0,
        type: "",
        value: [],
        desc: ""
    };

    answers.forEach( answer => {
        response.name = answer.name;
        response.ttl = answer.ttl;
        response.type = answer.type;
        response.value.push(answer.data);
        response.desc = dnsType.desc;
    });

    return response;
}

function formatA(data) {
    return "<a href=\"https://talosintelligence.com/reputation_center/lookup?search="+data+"\">"+data+"</a>";
}

function formatCNAME(data) {
    return "<a href=\"#/dig/"+data+"\">"+data+"</a>";
}

function formatMX(data) {
    return data.preference + " " + data.exchange;
}

function formatSOA(data) {
    return data.mname + ". " + data.rname + ". " + data.serial + " " + data.refresh + " " + data.retry + " " + data.expire + " " + data.minimum;
}

function formatAnswer(type, answer) {
    switch (type) {
        case "A":
            answer = formatA(answer);
            break;
        case "CNAME":
            answer = formatCNAME(answer);
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