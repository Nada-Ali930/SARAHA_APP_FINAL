
export const createRondomOtp = async()=>{
    return Math.floor( Math.random() * 900000 + 100000 );  //generate 6 numbers rondom
}