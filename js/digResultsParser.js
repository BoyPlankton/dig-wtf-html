function parseAnswer(answer) {
    var data = answer.data;

    switch (answer.type) {
        case "MX":
            data = parseMX(data);
            break;
    }

    return {
        name: answer.name, 
        ttl: answer.ttl, 
        type: answer.type, 
        value: data
    }
}

function parseMX(data) {
    return data.preference + " " + data.exchange;
}