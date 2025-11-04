function error(message,code){
    let e = new Error();

    if(code){ e.statusCode = code; }

    return e;
}

export default error;