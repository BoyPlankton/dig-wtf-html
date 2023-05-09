function parseAnswer(answer) {
    var data = answer.data;

    switch (answer.type) {
        case "A":
            data = parseA(data);
            break;
        case "MX":
            data = parseMX(data);
            break;
        case "SOA":
            data = parseSOA(data);
            break;
    }

    return {
        name: answer.name, 
        ttl: answer.ttl, 
        type: answer.type, 
        value: data
    }
}

function parseA(data) {
    return "<a href=\"https://talosintelligence.com/reputation_center/lookup?search="+data+"\">"+data+"</a>";
}

function parseMX(data) {
    return data.preference + " " + data.exchange;
}

function parseSOA(data) {
    return data.mname + ". " + data.rname + ". " + data.serial + " " + data.refresh + " " + data.retry + " " + data.expire + " " + data.minimum;
}
