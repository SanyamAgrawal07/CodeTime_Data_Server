function getTime(duration){
    const min = duration/60
    if(min%60===0){
        return (`${min/60} hr`)
    }
    else{
        return (`${Math.floor(min/60)} hr ${min%60} min`)
    }
}

module.exports = getTime