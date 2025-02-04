import axios from 'axios';

export const calculateCall = async (data) => {
    try {
        const response = await axios.post("/api/controllers/call", data, {
            headers: {
                Accept: 'application/json',
            }
        });
        return response.data.data
    } catch (error) {
       console.log(error)
    }
}

export const calculatePut = async (data) => {
    try {
        const response = await axios.post("/api/controllers/put", data, {
            headers: {
                Accept: 'application/json',
            }
        });
        return response.data.data   
    } catch (error) {
       console.log(error)
    }
}


//mobile version


